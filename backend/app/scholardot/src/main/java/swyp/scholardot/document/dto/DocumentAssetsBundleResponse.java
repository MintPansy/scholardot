package swyp.scholardot.document.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DocumentAssetsBundleResponse {
    private List<DocumentAssetResponse> assets;
    private List<DocumentAssetReferenceResponse> references;
}
