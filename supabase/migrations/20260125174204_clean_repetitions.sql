DELETE FROM public.ebd_devotionals 
WHERE title LIKE '%A Rocha que não se Abala%';

DELETE FROM public.ebd_devotionals 
WHERE day >= CURRENT_DATE;
