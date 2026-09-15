package swyp.scholardot.document.dto;

import lombok.Builder;
import lombok.Getter;
import swyp.scholardot.document.enums.DocumentAssetKind;

@Getter
@Builder
public class DocumentAssetResponse {
    private Long id;
    private DocumentAssetKind kind;
    private String number;
    private String caption;
    private Integer sourcePage;
    private Integer orderInDoc;
}
