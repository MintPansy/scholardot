package swyp.paperdot.document.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PdfExtractTextNormalizerTest {

    @Test
    void mergesBrokenAcronyms() {
        assertEquals("PDF uploads are supported.", PdfExtractTextNormalizer.normalize("PD F uploads are supported."));
        assertEquals("GPT and NLP baselines.", PdfExtractTextNormalizer.normalize("GP T and NL P baselines."));
        assertEquals("FAISS index lookup.", PdfExtractTextNormalizer.normalize("FA ISS index lookup."));
    }

    @Test
    void fixesHyphenatedProductNames() {
        assertEquals("Sentence-BERT embeddings.", PdfExtractTextNormalizer.normalize("Sentence- BERT embeddings."));
        assertEquals("ScholarDot pipeline.", PdfExtractTextNormalizer.normalize("Scholar Dot pipeline."));
    }

    @Test
    void doesNotGlueNormalEnglish() {
        assertEquals("A model is trained.", PdfExtractTextNormalizer.normalize("A model is trained."));
        assertEquals("In the experiment.", PdfExtractTextNormalizer.normalize("In the experiment."));
    }
}
