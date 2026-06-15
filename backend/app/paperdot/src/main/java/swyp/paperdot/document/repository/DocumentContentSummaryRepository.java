package swyp.paperdot.document.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swyp.paperdot.document.domain.DocumentContentSummary;

import java.util.Optional;

public interface DocumentContentSummaryRepository extends JpaRepository<DocumentContentSummary, Long> {

    Optional<DocumentContentSummary> findByDocumentId(Long documentId);

    void deleteByDocumentId(Long documentId);
}
