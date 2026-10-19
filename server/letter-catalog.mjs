// User-written wishes, lightly corrected for spelling and punctuation.
// [tên] is replaced in the browser; this endpoint never needs a real name.
const messages = [
  'Chào [tên], 20/10 vui vẻ nhé! Chúc cậu luôn rạng rỡ theo cách riêng của mình và có thật nhiều kỷ niệm đẹp cùng lớp. Cảm ơn cậu vì đã là một phần của TCTT67C, và của những năm tháng sinh viên mà anh em mình sẽ còn nhớ lâu.',
  'Hi [tên], chúc cậu một ngày 20/10 thật vuiiii. Mong những năm học cùng lớp sẽ có nhiều chuyện khiến cậu nhớ mãi. Chúc cậu 20/10 này thật vui vẻ bên gia đình và cả bên TCTT67C!',
  'Gửi [tên], chúc cậu luôn khỏe mạnh, vui vẻ và làm được những điều mình thích. Hy vọng món quà nhỏ này sẽ giúp cậu có một ngày 20/10 vui vẻ. Chúc cậu luôn xinh đẹp nhé!',
  'Chào [tên], chúc cậu 20/10 nhận được nhiều lời chúc dễ thương và có một ngày thật vui. Mong nụ cười sẽ luôn ở trên môi cậu.',
  '[tên], chúc cậu có một ngày 20/10 vui vẻ và luôn quý lớp mìnhhh!',
  '20/10 vui nha [tên]! Chúc cậu ngày càng tự tin và gặp nhiều điều khiến mình thấy vui.',
  'Chào [tên], hôm nay các bạn nam của lớp gửi cậu một lời chúc nhỏ. Chúc cậu luôn khỏe, vui và có những người thân bên cạnh trong ngày 20/10 nàyy.',
  '[tên] ơi, chúc cậu một ngày 20/10 thật vui vẻ nhéee. Mong cậu luôn tích cực, vui vẻ và rực rỡ như những bông hoa.',
  'Chúc [tên] một ngày 20/10 thật dễ chịu. Mong cậu có thời gian làm điều mình thích, gặp những người mình quý và tận hưởng những ngày còn đi học.',
  'Gửi [tên], chúc cậu luôn thoải mái là chính mình và vui với những lựa chọn của cậu. Mong quãng thời gian ở TCTT67C sẽ mang đến cho cậu những người bạn thật tốt. Hãy tận hưởng quãng thời gian ở đâyyy!',
  '[tên] ơi, 20/10 này chúng tớ chúc cậu thật nhiều niềm vui và may mắn. Mong cậu luôn tích cực, tươi cười và rực rỡ.',
  'Chào [tên], chúc cậu có một ngày 20/10 đáng nhớ theo cách cậu thích. Cảm ơn vì chúng mình đã có dịp trở thành bạn cùng lớp.',
  '20/10 vui nhé [tên]! Mong những lời chúc của anh em TCTT67C sẽ giúp cậu vui lên.',
  '[tên] à, nhận thiệp rồi thì nhớ dành cho mình một ngày thật vui nhé. Chúng tớ chúc cậu luôn khỏe mạnh và có nhiều điều để háo hức chờ đợi. Mong những năm học cùng TCTT67C sẽ thật đáng nhớ.',
  'Chào [tên], chúc cậu ngày 20/10 có nhiều tiếng cười và những kỷ niệm đáng nhớ.',
  'Gửi [tên], chúc cậu 20/10 xinh đẹp hơn, tươi cười rạng rỡ hơn và sớm đạt được những ước mơ, những điều mà cậu muốn.',
  '[tên] ơi, chúc cậu một ngày 20/10 được bạn bè quan tâm và nhận được những lời chúc khiến mình thấy vui. Tấm thiệp này cũng là một lời chúc chúng tớ gửi riêng đến cậu. Mong hôm nay sẽ thành một kỷ niệm nhỏ mà cậu muốn giữ lại.',
  '20/10 vui vẻ nhé [tên]! Chúc cậu được làm điều mình thích, đi những nơi mình muốn và có bạn bè sẵn sàng đi cùng. Trong những năm học này, hy vọng chúng tớ sẽ được góp mặt trong nhiều kỷ niệm vui của cậu.',
  'Chào [tên], mong hôm nay cậu có nhiều lý do để vui hơn mọi ngày. Chúc cậu ngày 20/10 vui vẻ nhéee.',
  '[tên] à, nhân ngày 20/10, chúc cậu luôn vui vẻ và gặp nhiều điều tốt đẹp.',
  'Chúc [tên] 20/10 thật vui. Hy vọng món quà nhỏ này của lớp cũng làm cậu vui thêm một chút.',
  'Chào [tên], chúc 20/10 này của cậu thật vui vẻ và đáng nhớ. Sẽ còn nhiều điều hay ho đang đón chờ cậuuu!',
  '[tên] ơi, hôm nay ngày 20/10 chúng tớ gửi cậu một bó hoa và một lời chúc thật vuii. Chúc cậu luôn khỏe, vui và có nhiều kỷ niệm đẹp với TCTT67C.',
  'Gửi [tên], chúc cậu 20/10 có những niềm vui và cả những bất ngờ nho nhỏ. Mong những ngày học cùng lớp sẽ có thêm nhiều tiếng cười.',
  'Mong [tên] có một ngày 20/10 siêu vui và siêu đáng nhớ. Mong cậu sẽ luôn vui vẻ, cười thật nhiều và rạng rỡ như những bông hoa này!!',
  '[tên] à, mong những năm đại học này sẽ cho cậu nhiều trải nghiệm đáng nhớ. Chúng tớ rất vui vì được là bạn cùng lớp của cậu. CHÚC 20/10 VUI VẺEEE!',
  '20/10 vui nha [tên]! Chúc cậu có một ngày 20/10 thật hạnh phúc và luôn vui vẻ tận hưởng thời gian đi học với chúng mình.',
  'Chào [tên], chúc cậu 20/10 xinh như bông hoa này, nhiều may mắn và việc học tập thuận lợi hơnn, học bổng 10 kỳ luôn =))). Mong bức thư này khiến cậu cảm thấy vui hơn.',
  'Chúc [tên] một ngày 20/10 đáng nhớ và thật nhiều kỷ niệm đẹp. Cậu luôn mang đến cho lớp mình niềm vui và tinh thần trách nhiệmm. Mong cậu cảm thấy vui vẻ và hạnh phúc với quãng thời gian bên TCTT67C.',
  'Chào [tên], chúc cậu một ngày 20/10 thật rực rỡ và có nhiều điều khiến mình thấy vui. Mong cậu sẽ có những kỷ niệm đẹp cùng TCTT67C.'
];
export const LETTERS = messages.map((text, index) => ({
  id:index + 1, paragraphs:[text], signature:'Từ các bạn nam TCTT67C'
}));
