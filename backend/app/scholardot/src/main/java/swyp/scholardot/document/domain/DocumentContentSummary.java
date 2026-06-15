package swyp.scholardot.document.domain;

import jakarta.persistence.*;
import lombok.*;
import swyp.scholardot.document.enums.SummaryStatus;

import java.time.Instant;

@Entity
@Table(name = "document_content_summaries")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DocumentContentSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long documentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SummaryStatus status;

    @Column(columnDefinition = "TEXT")
    private String topic;

    @Column(columnDefinition = "TEXT")
    private String method;

    @Column(columnDefinition = "TEXT")
    private String findings;

    @Column(columnDefinition = "TEXT")
    private String limitations;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    private Instant generatedAt;

    public static DocumentContentSummary generating(Long documentId) {
        DocumentContentSummary summary = new DocumentContentSummary();
        summary.documentId = documentId;
        summary.status = SummaryStatus.GENERATING;
        return summary;
    }

    public void markReady(String topic, String method, String findings, String limitations) {
        this.status = SummaryStatus.READY;
        this.topic = topic;
        this.method = method;
        this.findings = findings;
        this.limitations = limitations;
        this.errorMessage = null;
        this.generatedAt = Instant.now();
    }

    public void markFailed(String message) {
        this.status = SummaryStatus.FAILED;
        this.errorMessage = message;
        this.generatedAt = Instant.now();
    }
}
