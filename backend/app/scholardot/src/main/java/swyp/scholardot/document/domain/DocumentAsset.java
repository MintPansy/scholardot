package swyp.scholardot.document.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import swyp.scholardot.document.enums.DocumentAssetKind;

import java.time.Instant;

/**
 * PDF에서 추출한 Figure/Table 메타데이터.
 * v1은 캡션·번호·페이지 연결만 저장하며, 영역 크롭은 하지 않는다.
 */
@Entity
@Table(
        name = "document_assets",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_document_assets_doc_kind_number",
                columnNames = {"document_id", "kind", "number"}
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DocumentAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_id", nullable = false)
    private Long documentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private DocumentAssetKind kind;

    /** 정규화된 번호 문자열 (예: "1", "2a"). */
    @Column(nullable = false, length = 32)
    private String number;

    @Column(columnDefinition = "TEXT")
    private String caption;

    /** 원본 PDF 1-based 페이지. */
    @Column(name = "source_page", nullable = false)
    private Integer sourcePage;

    @Column(name = "order_in_doc", nullable = false)
    private Integer orderInDoc;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Builder
    public DocumentAsset(
            Long documentId,
            DocumentAssetKind kind,
            String number,
            String caption,
            Integer sourcePage,
            Integer orderInDoc
    ) {
        this.documentId = documentId;
        this.kind = kind;
        this.number = number;
        this.caption = caption;
        this.sourcePage = sourcePage != null ? sourcePage : 1;
        this.orderInDoc = orderInDoc != null ? orderInDoc : 0;
    }
}
