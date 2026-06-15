package swyp.scholardot.document.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swyp.scholardot.document.domain.DocumentContentSummary;

import java.util.Optional;

public interface DocumentContentSummaryRepository extends JpaRepository<DocumentContentSummary, Long> {

    Optional<DocumentContentSummary> findByDocumentId(Long documentId);

    void deleteByDocumentId(Long documentId);
}
