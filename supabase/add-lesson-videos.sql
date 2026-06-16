-- Mentoria Hub — populate demo lesson videos.
-- Sets a real, streamable video on each seeded lesson so the 90%-watch gate is
-- demonstrable. Uses Google's public sample MP4s (stable, CORS-friendly).
-- Idempotent: safe to re-run. Matches lessons by title.

update lessons set video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'           where title = 'Academic Vocabulary Foundations';
update lessons set video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'          where title = 'Structuring an Argument Essay';
update lessons set video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'              where title = 'Speaking with Confidence';

update lessons set video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'         where title = 'Linear Equations & Inequalities';
update lessons set video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'        where title = 'Ratios, Proportions & Percentages';
update lessons set video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBubbles.mp4'       where title = 'Intro to Functions';

update lessons set video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'              where title = 'Motion & Speed';
update lessons set video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'            where title = 'Forces & Newton''s Laws';
update lessons set video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'              where title = 'Energy & Work';

update lessons set video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4'       where title = 'Supply & Demand';
update lessons set video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4' where title = 'Opportunity Cost';
update lessons set video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'                    where title = 'Money & Inflation';
