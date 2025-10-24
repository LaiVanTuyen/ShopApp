package com.project.shopapp.responses;


import jakarta.persistence.MappedSuperclass;
import lombok.*;

import java.util.List;

@Data//toString
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
public class CommentCountResponse {
    private Double avgRating;
    private Integer commentCount;
    private List<CommentResponse> comments;
}
