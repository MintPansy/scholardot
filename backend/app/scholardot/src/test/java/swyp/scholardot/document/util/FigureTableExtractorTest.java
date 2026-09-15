package swyp.scholardot.document.util;

import org.junit.jupiter.api.Test;
import swyp.scholardot.document.enums.DocumentAssetKind;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FigureTableExtractorTest {

    @Test
    void extractsFigureAndTableCaptionsWithPage() {
        List<String> pages = List.of(
                "Introduction text.\nFigure 1. Overview of the ScholarDot pipeline.\nMore text.",
                "Results.\nTable 2: Ablation study on sentence splitting.\nConclusion."
        );

        List<FigureTableExtractor.ExtractedCaption> captions = FigureTableExtractor.extractCaptions(pages);
        assertEquals(2, captions.size());

        assertEquals(DocumentAssetKind.FIGURE, captions.get(0).kind());
        assertEquals("1", captions.get(0).number());
        assertEquals(1, captions.get(0).sourcePage());
        assertTrue(captions.get(0).caption().toLowerCase().contains("overview"));

        assertEquals(DocumentAssetKind.TABLE, captions.get(1).kind());
        assertEquals("2", captions.get(1).number());
        assertEquals(2, captions.get(1).sourcePage());
        assertTrue(captions.get(1).caption().toLowerCase().contains("ablation"));
    }

    @Test
    void dedupesSameFigureNumberKeepingFirstPage() {
        List<String> pages = List.of(
                "Figure 1. First caption.",
                "As shown in Figure 1, the model improves."
        );
        List<FigureTableExtractor.ExtractedCaption> captions = FigureTableExtractor.extractCaptions(pages);
        assertEquals(1, captions.size());
        assertEquals(1, captions.get(0).sourcePage());
        assertTrue(captions.get(0).caption().contains("First"));
    }

    @Test
    void findsBodyReferencesIncludingFigAbbreviation() {
        String text = "As shown in Fig. 2 and Table 3, the F1 score improves.";
        List<FigureTableExtractor.TextMatch> refs = FigureTableExtractor.findReferences(text);
        assertEquals(2, refs.size());
        assertEquals(DocumentAssetKind.FIGURE, refs.get(0).kind());
        assertEquals("2", refs.get(0).number());
        assertEquals(DocumentAssetKind.TABLE, refs.get(1).kind());
        assertEquals("3", refs.get(1).number());
    }

    @Test
    void normalizesFigWithoutSpaceBeforeNumber() {
        List<FigureTableExtractor.TextMatch> refs =
                FigureTableExtractor.findReferences("See Figure1 for details.");
        // Pattern requires whitespace or optional via \s* — Fig.?\s*\d works with "Figure1"? 
        // BODY has \s* so Figure1 should match
        assertEquals(1, refs.size());
        assertEquals("1", refs.get(0).number());
    }
}
