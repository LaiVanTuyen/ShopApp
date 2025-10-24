package com.project.shopapp.controllers;

import com.project.shopapp.responses.CommentCountResponse;
import com.project.shopapp.services.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @GetMapping("/stats")
    public CommentCountResponse getCommentStats(
            @RequestParam(value = "productId", required = false) Long productId,
            @RequestParam(value = "userId", required = false) Long userId
    ) {
        return commentService.getCommentCountsGroupedByProduct(productId, userId);
    }
}

