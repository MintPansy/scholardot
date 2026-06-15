package swyp.scholardot.document.note.dto;

import lombok.*;
import swyp.scholardot.document.note.NoteType;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDocNoteRequest {

    private Long docUnitId;
    private NoteType noteType;
    private String content;
    private String color;
}
