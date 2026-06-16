-- Mentoria Hub — sample catalog seed for the production Supabase schema.
-- Run after schema.sql. Mirrors the in-app demo catalog so a freshly wired
-- Supabase backend shows the same realistic data.

insert into opportunities (title, organizer, category, direction, format, deadline, description, requirements, apply_url, grade_min, grade_max, tags) values
('National Mathematics Olympiad', 'Republican Olympiad Committee', 'Olympiad', 'STEM', 'In-person', current_date + 6, 'The flagship national olympiad in mathematics for secondary school students.', 'Grades 9-11. Strong algebra and geometry.', 'https://example.org/apply/math-olympiad', 9, 11, '{math,olympiad,stem,competition,scholarship}'),
('Junior Business Case Competition', 'Mentoria Partners', 'Competition', 'Business', 'Hybrid', current_date + 12, 'Teams solve a real startup case and pitch to founders and investors.', 'Grades 9-12. Teams of 2-4.', 'https://example.org/apply/biz-case', 9, 12, '{business,startup,pitch,finance,competition}'),
('STEM Summer School Abroad', 'Global Science Foundation', 'Summer School', 'STEM', 'In-person', current_date + 28, 'A two-week residential program covering physics, robotics and applied math.', 'Grades 10-11. Motivation letter.', 'https://example.org/apply/stem-summer', 10, 11, '{stem,physics,robotics,summer,research}'),
('Future Leaders Scholarship', 'Mentoria Foundation', 'Scholarship', 'Social Impact', 'Online', current_date + 18, 'A merit-and-need scholarship covering tuition for online courses and exam fees.', 'Grades 9-12. Essay on a community project.', 'https://example.org/apply/scholarship', 9, 12, '{scholarship,leadership,community,essay}'),
('TeenHack Coding Hackathon', 'DevKids Community', 'Hackathon', 'Coding', 'Hybrid', current_date + 9, 'A 48-hour hackathon where students build apps that solve a local problem.', 'Grades 8-12. Beginners welcome.', 'https://example.org/apply/teenhack', 8, 12, '{coding,hackathon,web,apps,programming}'),
('Young Researchers Program', 'Academy of Sciences', 'Research', 'Science', 'Online', current_date + 35, 'Pairs students with a scientist mentor to complete a small research project.', 'Grades 10-12. Interest in biology, chemistry or physics.', 'https://example.org/apply/young-researchers', 10, 12, '{research,science,biology,mentorship}'),
('Financial Literacy Challenge', 'FinFuture', 'Competition', 'Finance', 'Online', current_date + 15, 'An online competition testing budgeting, investing and economics knowledge.', 'Grades 9-12. No prior finance experience needed.', 'https://example.org/apply/fin-challenge', 9, 12, '{finance,economics,investing,competition}'),
('Eco Volunteering Initiative', 'GreenSteppe NGO', 'Volunteering', 'Social Impact', 'In-person', current_date + 40, 'Join local environmental projects and earn a volunteering certificate.', 'Grades 8-12. Weekend availability.', 'https://example.org/apply/eco-volunteer', 8, 12, '{volunteering,environment,community,certificate}'),
('Tech Startup Internship', 'Mentoria Partners', 'Internship', 'Coding', 'Hybrid', current_date + 22, 'A part-time internship at a local tech startup shadowing engineers.', 'Grades 11-12. Familiarity with one programming language.', 'https://example.org/apply/startup-internship', 11, 12, '{internship,coding,startup,career}'),
('International Debate Tournament', 'Speak Up League', 'Competition', 'Social Impact', 'Online', current_date + 11, 'A British Parliamentary debate tournament building public speaking skills.', 'Grades 9-12. Upper-intermediate English.', 'https://example.org/apply/debate', 9, 12, '{debate,english,public speaking,competition}'),
('SAT Bootcamp Scholarship', 'Mentoria Foundation', 'Scholarship', 'STEM', 'Online', current_date + 4, 'Free seats in an intensive SAT preparation bootcamp.', 'Grades 10-12. Diagnostic test required.', 'https://example.org/apply/sat-bootcamp', 10, 12, '{sat,test prep,university,scholarship}'),
('Biology Knowledge Olympiad', 'Republican Olympiad Committee', 'Olympiad', 'Science', 'In-person', current_date + 26, 'A staged olympiad in biology covering cells, genetics and ecology.', 'Grades 9-11. School-level biology.', 'https://example.org/apply/bio-olympiad', 9, 11, '{biology,olympiad,science,genetics}');

-- ----- Courses & lessons -----
-- Each course is inserted and its lessons attached via the returned id, so the
-- quiz JSON and lesson order match the in-app demo catalog.

with c as (
  insert into courses (title, description, level, subject, direction, emoji, tags) values
  ('English for Academic Success', 'Build the academic English you need for essays, presentations and standardized tests like IELTS and SAT.', 'Intermediate', 'English', 'Social Impact', '📘', '{english,ielts,sat,writing,academic,university}')
  returning id
)
insert into lessons (course_id, position, title, content, duration_min, quiz)
select c.id, v.position, v.title, v.content, v.duration_min, v.quiz::jsonb from c, (values
  (0, 'Academic Vocabulary Foundations', 'Academic writing relies on precise, formal vocabulary. Learn high-frequency academic words and linking words (however, therefore, moreover).', 12, '[{"id":"q1","question":"Which word is the most formal replacement for ''a lot of''?","options":["lots of","numerous","tons of","plenty"],"answer":1},{"id":"q2","question":"Which is a linking word that shows contrast?","options":["therefore","however","moreover","because"],"answer":1}]'),
  (1, 'Structuring an Argument Essay', 'A strong argument essay has an intro with a clear thesis, body paragraphs (PEEL: Point, Evidence, Explanation, Link) and a conclusion.', 15, '[{"id":"q1","question":"What does the ''P'' in PEEL stand for?","options":["Plan","Point","Proof","Phrase"],"answer":1},{"id":"q2","question":"Where should your thesis statement appear?","options":["Introduction","First body paragraph","Conclusion","Anywhere"],"answer":0}]'),
  (2, 'Speaking with Confidence', 'Academic speaking rewards clarity over speed. Use signposting language and support claims with examples.', 10, '[{"id":"q1","question":"What is ''signposting'' in a presentation?","options":["Speaking very fast","Using language that guides the listener","Memorizing the whole speech","Avoiding eye contact"],"answer":1}]')
) as v(position, title, content, duration_min, quiz);

with c as (
  insert into courses (title, description, level, subject, direction, emoji, tags) values
  ('Math Foundations', 'Strengthen the core algebra and problem-solving skills that power olympiads, the SAT and STEM careers.', 'Beginner', 'Mathematics', 'STEM', '📐', '{math,algebra,problem solving,sat,stem,olympiad}')
  returning id
)
insert into lessons (course_id, position, title, content, duration_min, quiz)
select c.id, v.position, v.title, v.content, v.duration_min, v.quiz::jsonb from c, (values
  (0, 'Linear Equations & Inequalities', 'A linear equation has the form ax + b = c. Solve by isolating x. Flip the inequality sign when multiplying or dividing by a negative.', 14, '[{"id":"q1","question":"Solve: 3x + 6 = 21. What is x?","options":["3","5","7","9"],"answer":1},{"id":"q2","question":"When do you flip an inequality sign?","options":["Always","When adding a number","When dividing by a negative number","Never"],"answer":2}]'),
  (1, 'Ratios, Proportions & Percentages', 'Percentages are ratios out of 100. To find 15% of 80, multiply 80 x 0.15 = 12. Use proportions by cross-multiplying.', 13, '[{"id":"q1","question":"What is 20% of 150?","options":["15","20","30","45"],"answer":2}]'),
  (2, 'Intro to Functions', 'A function maps each input to exactly one output. f(x) = 2x + 1 means: take x, double it, add one.', 16, '[{"id":"q1","question":"If f(x) = 2x + 1, what is f(3)?","options":["5","6","7","8"],"answer":2}]')
) as v(position, title, content, duration_min, quiz);

with c as (
  insert into courses (title, description, level, subject, direction, emoji, tags) values
  ('Physics Foundations', 'Understand motion, forces and energy with intuitive examples that connect formulas to the real world.', 'Beginner', 'Physics', 'Science', '🔭', '{physics,motion,energy,science,stem}')
  returning id
)
insert into lessons (course_id, position, title, content, duration_min, quiz)
select c.id, v.position, v.title, v.content, v.duration_min, v.quiz::jsonb from c, (values
  (0, 'Motion & Speed', 'Speed = distance / time. Velocity adds direction. Acceleration is how quickly velocity changes.', 12, '[{"id":"q1","question":"A runner covers 100 m in 20 s. What is the average speed?","options":["2 m/s","5 m/s","10 m/s","20 m/s"],"answer":1}]'),
  (1, 'Forces & Newton''s Laws', 'Newton''s second law: F = ma. A larger force produces a larger acceleration; a heavier object accelerates less for the same force.', 15, '[{"id":"q1","question":"In F = ma, what does ''a'' represent?","options":["Area","Acceleration","Amplitude","Angle"],"answer":1}]'),
  (2, 'Energy & Work', 'Work = force x distance. Energy is the capacity to do work and is conserved — it changes form but is never lost.', 13, '[{"id":"q1","question":"Which statement reflects conservation of energy?","options":["Energy can be created","Energy changes form but total stays constant","Energy always decreases to zero","Energy only exists as motion"],"answer":1}]')
) as v(position, title, content, duration_min, quiz);

with c as (
  insert into courses (title, description, level, subject, direction, emoji, tags) values
  ('Intro to Economics', 'Learn how markets, money and incentives shape everyday decisions — perfect for future business and finance students.', 'Beginner', 'Economics', 'Finance', '💹', '{economics,finance,business,markets,money}')
  returning id
)
insert into lessons (course_id, position, title, content, duration_min, quiz)
select c.id, v.position, v.title, v.content, v.duration_min, v.quiz::jsonb from c, (values
  (0, 'Supply & Demand', 'Demand falls as price rises; supply rises as price rises. The market price settles at the equilibrium where the curves meet.', 12, '[{"id":"q1","question":"What usually happens to demand when price increases?","options":["It increases","It decreases","It stays the same","It doubles"],"answer":1}]'),
  (1, 'Opportunity Cost', 'Every choice has a cost — the value of the next best alternative you gave up. Good decisions weigh these trade-offs.', 11, '[{"id":"q1","question":"Opportunity cost is best described as…","options":["The money you spend","The value of the next best alternative given up","A type of tax","The total budget"],"answer":1}]'),
  (2, 'Money & Inflation', 'Money is a medium of exchange, store of value and unit of account. Inflation is a general rise in prices that reduces purchasing power.', 13, '[{"id":"q1","question":"Inflation means that over time…","options":["Money buys more","Prices generally rise and money buys less","Prices are fixed","Banks close"],"answer":1}]')
) as v(position, title, content, duration_min, quiz);

-- ----- Demo lesson videos (stable public sample MP4s; powers the 90%-watch gate) -----
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
