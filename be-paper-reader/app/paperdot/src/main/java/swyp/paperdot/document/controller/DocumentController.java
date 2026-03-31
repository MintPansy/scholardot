package swyp.paperdot.document.controller;

import java.io.InputStream;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import swyp.paperdot.document.dto.DocumentResponse;
import swyp.paperdot.document.dto.DocumentUploadRequest;
import swyp.paperdot.document.service.DocumentDownloadService;
import swyp.paperdot.document.service.DocumentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/documents")
@Tag(name = "Document", description = "문서 업로드 및 저장 API")
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentDownloadService documentDownloadService;

    public DocumentController(DocumentService documentService, DocumentDownloadService documentDownloadService) {
        this.documentService = documentService;
        this.documentDownloadService = documentDownloadService;
    }

    @Operation(
            summary = "문서 업로드",
            description = "PDF 문서를 오브젝트 스토리지에 업로드하고 메타데이터를 저장합니다."
    )
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse upload(@ModelAttribute DocumentUploadRequest request) {
        return documentService.upload(request);
    }

    @Operation(
            summary = "원본 PDF 다운로드",
            description = "저장된 원본 PDF 파일을 반환합니다. inline=true이면 브라우저에서 바로 열고, false이면 다운로드합니다."
    )
    @GetMapping("/{documentId}/file")
    public ResponseEntity<InputStreamResource> downloadPdf(
            @PathVariable Long documentId,
            @RequestParam(defaultValue = "true") boolean inline
    ) {
        InputStream inputStream = documentDownloadService.downloadOriginalPdf(documentId);

        String disposition = inline ? "inline" : "attachment; filename=\"document-" + documentId + ".pdf\"";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .body(new InputStreamResource(inputStream));
    }
}
