package com.project.shopapp.services.token;

import com.project.shopapp.components.JwtTokenUtils;
import com.project.shopapp.exceptions.DataNotFoundException;
import com.project.shopapp.exceptions.ExpiredTokenException;
import com.project.shopapp.models.Token;
import com.project.shopapp.models.User;
import com.project.shopapp.repositories.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenService implements ITokenService{
    private static final int MAX_TOKENS = 3;
    @Value("${jwt.expiration}")
    private int expiration; //save to an environment variable

    @Value("${jwt.expiration-refresh-token}")
    private int expirationRefreshToken;

    private final TokenRepository tokenRepository;
    private final JwtTokenUtils jwtTokenUtil;

    @Transactional
    @Override
    public Token addToken(User user, String token, boolean isMobileDevice) {
        List<Token> userTokens = tokenRepository.findByUser(user);
        int tokenCount = userTokens.size();
        // Kiểm tra nếu số lượng token vượt quá giới hạn cho phép
        if (tokenCount >= MAX_TOKENS) {
            // Tìm xem có token nào không phải từ thiết bị di động (non-mobile)
            Token tokenToDelete = userTokens.stream()
                    .filter(t -> !t.isMobile()) // Lọc các token không phải là mobile
                    .findFirst()               // Lấy token đầu tiên trong danh sách (nếu có)
                    .orElse(userTokens.get(0)); // Nếu không có, xóa token đầu tiên (FIFO)

            // Xóa token được chọn khỏi cơ sở dữ liệu
            tokenRepository.delete(tokenToDelete);
        }
        // Tính thời gian hết hạn cho token mới
        LocalDateTime expirationDateTime = LocalDateTime.now().plusSeconds(expiration);

        // Tạo token mới với các thông tin cần thiết
        Token newToken = Token.builder()
                .user(user)                           // Gắn người dùng vào token
                .token(token)                         // Gắn chuỗi token
                .revoked(false)                       // Mặc định: token chưa bị thu hồi
                .expired(false)                       // Mặc định: token chưa hết hạn
                .tokenType("Bearer")                  // Kiểu token là Bearer
                .expirationDate(expirationDateTime)   // Thời gian hết hạn
                .isMobile(isMobileDevice)             // Gắn thông tin thiết bị (mobile hoặc không)
                .build();

        // Tạo refresh token và gắn thời gian hết hạn cho nó
        newToken.setRefreshToken(UUID.randomUUID().toString());
        newToken.setRefreshExpirationDate(LocalDateTime.now().plusSeconds(expirationRefreshToken));

        return tokenRepository.save(newToken);
    }

    @Transactional
    @Override
    public Token refreshToken(String refreshToken, User user) throws Exception {
        // Tìm token hiện tại bằng refresh token từ cơ sở dữ liệu
        Token existingToken = tokenRepository.findByRefreshToken(refreshToken);
        if(existingToken == null) {
            throw new DataNotFoundException("Refresh token does not exist");
        }
        // Kiểm tra nếu refresh token đã hết hạn
        if (existingToken.getRefreshExpirationDate().isBefore(LocalDateTime.now())) {
            // Xóa token hết hạn khỏi cơ sở dữ liệu
            tokenRepository.delete(existingToken);
            throw new ExpiredTokenException("Refresh token is expired");
        }

        // Tạo token mới cho người dùng
        String newToken = jwtTokenUtil.generateToken(user);

        // Cập nhật thời gian hết hạn của token và refresh token
        existingToken.setExpirationDate(LocalDateTime.now().plusSeconds(expiration)); // Hạn token mới
        existingToken.setToken(newToken);                                             // Gán token mới
        existingToken.setRefreshToken(UUID.randomUUID().toString());                  // Tạo refresh token mới
        existingToken.setRefreshExpirationDate(LocalDateTime.now().plusSeconds(expirationRefreshToken)); // Hạn refresh mới

        // Lưu token đã cập nhật vào cơ sở dữ liệu
        return tokenRepository.save(existingToken);
    }
}
