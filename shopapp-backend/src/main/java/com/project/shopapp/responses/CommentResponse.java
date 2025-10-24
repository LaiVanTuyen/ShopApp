package com.project.shopapp.responses;

import jakarta.persistence.MappedSuperclass;
import lombok.*;

@Data//toString
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
public class CommentResponse extends  BaseResponse {
    private Long productId;
    private String content;
    private Integer rating;
    private String userName;
}
