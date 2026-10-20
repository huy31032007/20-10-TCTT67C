// Current 21-view captions, anchored to stable photo IDs so turns and shared
// reactions keep their identities. A merged view can have separate notes.
export const PAGE_CAPTIONS = [
  { page:1, notes:[{ photo:0, text:'Noel đầu tiên nè' }] },
  { page:2, notes:[
    { photo:27, text:'Đi quân sự vui nhờ <3' },
    { photo:29, text:'Team building đời đầu là đâyy=))' }
  ] },
  { page:3, notes:[{ photo:30, text:'“Dòng người vội vàng bước qua…”' }] },
  { page:4, notes:[{ photo:31, text:'“Lớp mình hô cái gì bây giờ TT”' }] },
  { page:5, notes:[{ photo:34, text:'Giải ba cơ đấyy?!?!' }] },
  { page:6, notes:[{ photo:35, text:'20/10 năm ngoái nè' }] },
  { page:7, notes:[{ photo:37, text:'Túi hoa đồ đó =))' }] },
  { page:8, notes:[{ photo:38, text:'“Vỗ tay đi ơ kìaaa”' }] },
  { page:9, notes:[{ photo:39, text:'“Lớp mình ra ngoài chụp 1 tấm đii”' }] },
  { page:10, notes:[{ photo:42, text:'Say Hi:”)' }] },
  { page:11, notes:[{ photo:12, text:'“Kìa kìa chụp ảnh kìa”' }] },
  { page:12, notes:[{ photo:1, text:'“Chụp 1 tấm khonggg”' }] },
  { page:13, notes:[{ photo:2, text:'Bá khí khá bí' }] },
  { page:14, notes:[{ photo:6, text:'Báo cáo sĩ số đủ!!' }] },
  { page:15, notes:[{ photo:10, text:'Ninh Bình trip' }] },
  { page:16, notes:[] },
  { page:17, notes:[] },
  { page:18, notes:[{ photo:23, text:'Vui chưa kìa' }] },
  { page:19, notes:[] },
  { page:20, notes:[] },
  { page:21, notes:[{ photo:24, text:'To be continued….' }] }
];

const captions = new Map(PAGE_CAPTIONS.flatMap(({ page, notes }) => notes.map(note => [note.photo, { ...note, page }])));
export function photoPageCaption(index) { return captions.get(index); }
