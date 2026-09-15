package swyp.scholardot.document.dto;

import lombok.Builder;
import lombok.Getter;
import swyp.scholardot.document.enums.DocumentAssetKind;

/**
 * 본문 문장 내 Figure/Table 참조와 document_assets 매칭 결과.
 * assetId가 null이면 캡션 자산을 찾지 못한 참조(보수적으로 UI에서 링크 생략 권장).
 */
@Getter
@Builder
public class DocumentAssetReferenceResponse {
    private Long docUnitId;
    private String matchText;
    private DocumentAssetKind kind;
    private String number;
    private Long assetId;
    private Integer sourcePage;
    /** MATCHED | UNMATCHED */
    private String confidence;
}
