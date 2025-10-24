package com.project.shopapp.repositories;

import com.project.shopapp.models.Comment;
import com.project.shopapp.responses.CommentResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    /**
     * Trả về danh sách comment projection (mỗi comment một dòng) để client/service có thể tự compute count/avg
     */
    @Query("""
                select c.product.id as productId,
                       c.content as content,
                       c.rating as rating,
                       c.createdAt as createdAt,
                       c.user.fullName as userName
                from Comment c
                where (:productId is null or c.product.id = :productId)
                and (:userId   is null or c.user.id   = :userId)
            """)
    List<CommentResponse> findCommentsFiltered(
            @Param("productId") Long productId,
            @Param("userId") Long userId);

}
