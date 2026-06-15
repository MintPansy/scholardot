package swyp.paperdot.document.dto;

import lombok.Builder;
import lombok.Getter;
import swyp.paperdot.document.enums.SummaryStatus;

import java.time.Instant;

@Getter
@Builder
public class DocumentContentSummaryResponse {

    /** GENERATING | READY | FAILED | NONE */
    private SummaryStatus status;
    private String topic;
    private String method;
    private String findings;
    private String limitations;
    private String errorMessage;
    private Instant generatedAt;
    private String disclaimer;
}
