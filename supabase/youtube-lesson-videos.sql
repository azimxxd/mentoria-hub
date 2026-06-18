-- Mentoria Hub — real YouTube lesson videos (validated embeddable via oEmbed).
-- Idempotent: matches lessons by title. Run in the Supabase SQL editor.

update lessons set video_url = 'https://www.youtube.com/watch?v=rfscVS0vtbw' where title = 'Academic Vocabulary Foundations';
update lessons set video_url = 'https://www.youtube.com/watch?v=PkZNo7MFNFg' where title = 'Structuring an Argument Essay';
update lessons set video_url = 'https://www.youtube.com/watch?v=tShavGuo0_E' where title = 'Speaking with Confidence';
update lessons set video_url = 'https://www.youtube.com/watch?v=MXV65i9g1Xg' where title = 'Linear Equations & Inequalities';
update lessons set video_url = 'https://www.youtube.com/watch?v=X2jVap1YgwI' where title = 'Ratios, Proportions & Percentages';
update lessons set video_url = 'https://www.youtube.com/watch?v=52tpYl2tTqk' where title = 'Intro to Functions';
update lessons set video_url = 'https://www.youtube.com/watch?v=ZM8ECpBuQYE' where title = 'Motion & Speed';
update lessons set video_url = 'https://www.youtube.com/watch?v=kKKM8Y-u7ds' where title = 'Forces & Newton''s Laws';
update lessons set video_url = 'https://www.youtube.com/watch?v=w4QFJb9a8vo' where title = 'Energy & Work';
update lessons set video_url = 'https://www.youtube.com/watch?v=g9aDizJpd_s' where title = 'Supply & Demand';
update lessons set video_url = 'https://www.youtube.com/watch?v=WUvTyaaNkzM' where title = 'Opportunity Cost';
update lessons set video_url = 'https://www.youtube.com/watch?v=spUNpyF58BY' where title = 'Money & Inflation';
