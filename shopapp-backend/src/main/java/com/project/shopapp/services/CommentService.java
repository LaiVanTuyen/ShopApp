package com.project.shopapp.services;

import com.project.shopapp.repositories.CommentRepository;
import com.project.shopapp.responses.CommentCountResponse;
import com.project.shopapp.responses.CommentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;

    public CommentCountResponse getCommentCountsGroupedByProduct(Long productId, Long userId) {
        List<CommentResponse> comments = commentRepository.findCommentsFiltered(productId, userId);

        CommentCountResponse result = new CommentCountResponse();

        // handle null or empty
        if (comments == null || comments.isEmpty()) {
            result.setComments(Collections.emptyList());
            result.setCommentCount(0);
            result.setAvgRating(null);
            return result;
        }

        result.setComments(comments);
        result.setCommentCount(comments.size());

        // compute average rating ignoring nulls
        OptionalDouble avgOpt = comments.stream()
                .map(CommentResponse::getRating)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average();

        result.setAvgRating(avgOpt.isPresent() ? avgOpt.getAsDouble() : null);

        return result;
    }

}
