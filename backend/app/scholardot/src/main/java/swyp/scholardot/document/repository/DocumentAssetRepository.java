package swyp.scholardot.document.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import swyp.scholardot.document.domain.DocumentAsset;

import java.util.List;

public interface DocumentAssetRepository extends JpaRepository<DocumentAsset, Long> {

    List<DocumentAsset> findByDocumentIdOrderByOrderInDocAsc(Long documentId);

    @Modifying
    @Query("DELETE FROM DocumentAsset a WHERE a.documentId = :documentId")
    void deleteByDocumentId(@Param("documentId") Long documentId);

    long countByDocumentId(Long documentId);
}
