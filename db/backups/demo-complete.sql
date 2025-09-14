--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (84ade85)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.timetables DROP CONSTRAINT IF EXISTS timetables_time_slot_id_time_slots_id_fk;
ALTER TABLE IF EXISTS ONLY public.timetables DROP CONSTRAINT IF EXISTS timetables_subject_id_subjects_id_fk;
ALTER TABLE IF EXISTS ONLY public.timetables DROP CONSTRAINT IF EXISTS timetables_room_id_rooms_id_fk;
ALTER TABLE IF EXISTS ONLY public.timetables DROP CONSTRAINT IF EXISTS timetables_faculty_id_faculty_id_fk;
ALTER TABLE IF EXISTS ONLY public.timetables DROP CONSTRAINT IF EXISTS timetables_division_id_divisions_id_fk;
ALTER TABLE IF EXISTS ONLY public.subjects DROP CONSTRAINT IF EXISTS subjects_department_id_departments_id_fk;
ALTER TABLE IF EXISTS ONLY public.students DROP CONSTRAINT IF EXISTS students_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.students DROP CONSTRAINT IF EXISTS students_division_id_divisions_id_fk;
ALTER TABLE IF EXISTS ONLY public.faculty DROP CONSTRAINT IF EXISTS faculty_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.faculty DROP CONSTRAINT IF EXISTS faculty_department_id_departments_id_fk;
ALTER TABLE IF EXISTS ONLY public.divisions DROP CONSTRAINT IF EXISTS divisions_department_id_departments_id_fk;
DROP TRIGGER IF EXISTS trigger_subject_department ON public.timetables;
DROP TRIGGER IF EXISTS trigger_room_conflict ON public.timetables;
DROP TRIGGER IF EXISTS trigger_room_capacity ON public.timetables;
DROP TRIGGER IF EXISTS trigger_faculty_department ON public.timetables;
DROP TRIGGER IF EXISTS trigger_faculty_conflict ON public.timetables;
DROP TRIGGER IF EXISTS trigger_division_conflict ON public.timetables;
DROP INDEX IF EXISTS public.idx_timetables_unique_active;
DROP INDEX IF EXISTS public.idx_timetables_time_slot_id;
DROP INDEX IF EXISTS public.idx_timetables_subject_id;
DROP INDEX IF EXISTS public.idx_timetables_room_unique_active;
DROP INDEX IF EXISTS public.idx_timetables_room_id;
DROP INDEX IF EXISTS public.idx_timetables_room_day;
DROP INDEX IF EXISTS public.idx_timetables_is_active;
DROP INDEX IF EXISTS public.idx_timetables_faculty_unique_active;
DROP INDEX IF EXISTS public.idx_timetables_faculty_id;
DROP INDEX IF EXISTS public.idx_timetables_division_id;
DROP INDEX IF EXISTS public.idx_timetables_day_of_week;
DROP INDEX IF EXISTS public.idx_timetables_day_active;
DROP INDEX IF EXISTS public.idx_time_slots_start_time;
DROP INDEX IF EXISTS public.idx_time_slots_is_active;
DROP INDEX IF EXISTS public.idx_subjects_department_id;
DROP INDEX IF EXISTS public.idx_students_user_id;
DROP INDEX IF EXISTS public.idx_students_roll_number;
DROP INDEX IF EXISTS public.idx_students_division_id;
DROP INDEX IF EXISTS public.idx_rooms_is_active;
DROP INDEX IF EXISTS public.idx_faculty_user_id;
DROP INDEX IF EXISTS public.idx_faculty_employee_id;
DROP INDEX IF EXISTS public.idx_faculty_department_id;
DROP INDEX IF EXISTS public.idx_divisions_department_id;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.timetables DROP CONSTRAINT IF EXISTS timetables_pkey;
ALTER TABLE IF EXISTS ONLY public.time_slots DROP CONSTRAINT IF EXISTS time_slots_pkey;
ALTER TABLE IF EXISTS ONLY public.subjects DROP CONSTRAINT IF EXISTS subjects_pkey;
ALTER TABLE IF EXISTS ONLY public.subjects DROP CONSTRAINT IF EXISTS subjects_code_unique;
ALTER TABLE IF EXISTS ONLY public.students DROP CONSTRAINT IF EXISTS students_roll_number_unique;
ALTER TABLE IF EXISTS ONLY public.students DROP CONSTRAINT IF EXISTS students_pkey;
ALTER TABLE IF EXISTS ONLY public.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.rooms DROP CONSTRAINT IF EXISTS rooms_pkey;
ALTER TABLE IF EXISTS ONLY public.rooms DROP CONSTRAINT IF EXISTS rooms_name_unique;
ALTER TABLE IF EXISTS ONLY public.faculty DROP CONSTRAINT IF EXISTS faculty_pkey;
ALTER TABLE IF EXISTS ONLY public.faculty DROP CONSTRAINT IF EXISTS faculty_employee_id_unique;
ALTER TABLE IF EXISTS ONLY public.divisions DROP CONSTRAINT IF EXISTS divisions_pkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_pkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_name_unique;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_code_unique;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.timetables;
DROP TABLE IF EXISTS public.time_slots;
DROP TABLE IF EXISTS public.subjects;
DROP TABLE IF EXISTS public.students;
DROP TABLE IF EXISTS public.schema_migrations;
DROP TABLE IF EXISTS public.rooms;
DROP TABLE IF EXISTS public.faculty;
DROP TABLE IF EXISTS public.divisions;
DROP TABLE IF EXISTS public.departments;
DROP FUNCTION IF EXISTS public.check_subject_department();
DROP FUNCTION IF EXISTS public.check_room_conflict();
DROP FUNCTION IF EXISTS public.check_room_capacity();
DROP FUNCTION IF EXISTS public.check_faculty_department();
DROP FUNCTION IF EXISTS public.check_faculty_conflict();
DROP FUNCTION IF EXISTS public.check_division_conflict();
--
-- Name: check_division_conflict(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_division_conflict() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM timetables 
        WHERE division_id = NEW.division_id 
        AND day_of_week = NEW.day_of_week 
        AND time_slot_id = NEW.time_slot_id 
        AND is_active = true 
        AND id != COALESCE(NEW.id, '')
    ) THEN
        RAISE EXCEPTION 'Division conflict: Division % already has a class for day % time slot %', 
            NEW.division_id, NEW.day_of_week, NEW.time_slot_id;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: check_faculty_conflict(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_faculty_conflict() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM timetables 
        WHERE faculty_id = NEW.faculty_id 
        AND day_of_week = NEW.day_of_week 
        AND time_slot_id = NEW.time_slot_id 
        AND is_active = true 
        AND id != COALESCE(NEW.id, '')
    ) THEN
        RAISE EXCEPTION 'Faculty conflict: Faculty % is already assigned for day % time slot %', 
            NEW.faculty_id, NEW.day_of_week, NEW.time_slot_id;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: check_faculty_department(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_faculty_department() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    faculty_dept_id VARCHAR;
    subject_dept_id VARCHAR;
    division_dept_id VARCHAR;
BEGIN
    SELECT department_id INTO faculty_dept_id FROM faculty WHERE id = NEW.faculty_id;
    SELECT department_id INTO subject_dept_id FROM subjects WHERE id = NEW.subject_id;
    SELECT department_id INTO division_dept_id FROM divisions WHERE id = NEW.division_id;
    
    -- Faculty should belong to same department as subject (if subject has department)
    -- Or faculty should belong to same department as division (for common subjects)
    IF subject_dept_id IS NOT NULL THEN
        IF faculty_dept_id != subject_dept_id THEN
            RAISE EXCEPTION 'Faculty-Subject mismatch: Faculty % from department % cannot teach subject % from department %', 
                NEW.faculty_id, faculty_dept_id, NEW.subject_id, subject_dept_id;
        END IF;
    ELSE
        -- For common subjects, faculty can be from any department
        -- This allows flexibility for common subjects like Math, English, Physics
        NULL;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: check_room_capacity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_room_capacity() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    room_cap INTEGER;
    div_cap INTEGER;
BEGIN
    SELECT capacity INTO room_cap FROM rooms WHERE id = NEW.room_id;
    SELECT capacity INTO div_cap FROM divisions WHERE id = NEW.division_id;
    
    IF room_cap < div_cap THEN
        RAISE EXCEPTION 'Room capacity insufficient: Room % (capacity %) cannot accommodate division % (capacity %)', 
            NEW.room_id, room_cap, NEW.division_id, div_cap;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: check_room_conflict(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_room_conflict() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM timetables 
        WHERE room_id = NEW.room_id 
        AND day_of_week = NEW.day_of_week 
        AND time_slot_id = NEW.time_slot_id 
        AND is_active = true 
        AND id != COALESCE(NEW.id, '')
    ) THEN
        RAISE EXCEPTION 'Room conflict: Room % is already booked for day % time slot %', 
            NEW.room_id, NEW.day_of_week, NEW.time_slot_id;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: check_subject_department(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_subject_department() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    subject_dept_id VARCHAR;
    division_dept_id VARCHAR;
BEGIN
    SELECT department_id INTO subject_dept_id FROM subjects WHERE id = NEW.subject_id;
    SELECT department_id INTO division_dept_id FROM divisions WHERE id = NEW.division_id;
    
    -- Allow common subjects (NULL department_id) for any division
    IF subject_dept_id IS NOT NULL AND subject_dept_id != division_dept_id THEN
        RAISE EXCEPTION 'Subject-Department mismatch: Subject % belongs to different department than division %', 
            NEW.subject_id, NEW.division_id;
    END IF;
    
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: divisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.divisions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    department_id character varying NOT NULL,
    capacity integer DEFAULT 60 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT check_division_capacity CHECK ((capacity > 0))
);


--
-- Name: faculty; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faculty (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    employee_id text NOT NULL,
    department_id character varying NOT NULL,
    designation text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rooms (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    capacity integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT check_room_capacity CHECK ((capacity > 0)),
    CONSTRAINT check_room_type CHECK ((type = ANY (ARRAY['classroom'::text, 'lab'::text, 'auditorium'::text, 'office'::text])))
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(255) NOT NULL,
    applied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    roll_number text NOT NULL,
    division_id character varying NOT NULL,
    year integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT check_student_year CHECK (((year >= 1) AND (year <= 4)))
);


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subjects (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    department_id character varying,
    credits integer DEFAULT 3 NOT NULL,
    type text DEFAULT 'theory'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT check_subject_credits CHECK ((credits > 0)),
    CONSTRAINT check_subject_type CHECK ((type = ANY (ARRAY['theory'::text, 'practical'::text, 'common'::text])))
);


--
-- Name: time_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_slots (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT check_time_slot_order CHECK ((end_time > start_time))
);


--
-- Name: timetables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timetables (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    division_id character varying NOT NULL,
    subject_id character varying NOT NULL,
    faculty_id character varying NOT NULL,
    room_id character varying NOT NULL,
    time_slot_id character varying NOT NULL,
    day_of_week integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT check_day_of_week CHECK (((day_of_week >= 1) AND (day_of_week <= 7)))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'student'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT check_user_role CHECK ((role = ANY (ARRAY['student'::text, 'faculty'::text, 'admin'::text])))
);


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, name, code, created_at) FROM stdin;
dept-it	Information Technology	IT	2025-09-14 07:41:48.440594
dept-cs	Computer Science	CS	2025-09-14 07:41:48.440594
dept-excs	Electronics & Computer Science	EXCS	2025-09-14 07:41:48.440594
dept-extc	Electronics & Telecommunication	EXTC	2025-09-14 07:41:48.440594
dept-bme	Biomedical Engineering	BME	2025-09-14 07:41:48.440594
\.


--
-- Data for Name: divisions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.divisions (id, name, department_id, capacity, created_at) FROM stdin;
div-it-a	IT-A	dept-it	60	2025-09-14 07:41:48.440594
div-it-b	IT-B	dept-it	60	2025-09-14 07:41:48.440594
div-it-c	IT-C	dept-it	60	2025-09-14 07:41:48.440594
div-cs-a	CS-A	dept-cs	60	2025-09-14 07:41:48.440594
div-cs-b	CS-B	dept-cs	60	2025-09-14 07:41:48.440594
div-cs-c	CS-C	dept-cs	60	2025-09-14 07:41:48.440594
div-excs-a	EXCS-A	dept-excs	60	2025-09-14 07:41:48.440594
div-excs-b	EXCS-B	dept-excs	60	2025-09-14 07:41:48.440594
div-extc-a	EXTC-A	dept-extc	60	2025-09-14 07:41:48.440594
div-extc-b	EXTC-B	dept-extc	60	2025-09-14 07:41:48.440594
div-bme-a	BME-A	dept-bme	40	2025-09-14 07:41:48.440594
\.


--
-- Data for Name: faculty; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faculty (id, user_id, employee_id, department_id, designation, created_at) FROM stdin;
fac-1	user-f1	EMP1001	dept-it	Professor	2025-09-14 07:41:48.440594
fac-2	user-f2	EMP1002	dept-it	Assistant Professor	2025-09-14 07:41:48.440594
fac-3	user-f3	EMP1003	dept-cs	Professor	2025-09-14 07:41:48.440594
fac-4	user-f4	EMP1004	dept-cs	Assistant Professor	2025-09-14 07:41:48.440594
fac-5	user-f5	EMP1005	dept-excs	Professor	2025-09-14 07:41:48.440594
fac-6	user-f6	EMP1006	dept-excs	Assistant Professor	2025-09-14 07:41:48.440594
fac-7	user-f7	EMP1007	dept-extc	Professor	2025-09-14 07:41:48.440594
fac-8	user-f8	EMP1008	dept-extc	Assistant Professor	2025-09-14 07:41:48.440594
fac-9	user-f9	EMP1009	dept-bme	Professor	2025-09-14 07:41:48.440594
fac-10	user-f10	EMP1010	dept-bme	Assistant Professor	2025-09-14 07:41:48.440594
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rooms (id, name, type, capacity, is_active, created_at) FROM stdin;
room-101	Room 101	classroom	60	t	2025-09-14 07:41:48.440594
room-102	Room 102	classroom	60	t	2025-09-14 07:41:48.440594
room-105	Room 105	classroom	60	t	2025-09-14 07:41:48.440594
lab-201	Lab 201	lab	30	t	2025-09-14 07:41:48.440594
lab-202	Lab 202	lab	30	t	2025-09-14 07:41:48.440594
lab-301	Lab 301	lab	30	t	2025-09-14 07:41:48.440594
auditorium	Auditorium	auditorium	200	t	2025-09-14 07:41:48.440594
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schema_migrations (version, applied_at) FROM stdin;
001_initial_schema	2025-09-14 07:40:34.4699
002_add_indexes	2025-09-14 07:40:34.644926
003_add_constraints	2025-09-14 07:40:34.841767
004_conflict_detection	2025-09-14 07:40:35.018775
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.students (id, user_id, roll_number, division_id, year, created_at) FROM stdin;
std-1	user-s1	ITA001	div-it-a	2	2025-09-14 07:41:48.440594
std-2	user-s2	ITB002	div-it-b	2	2025-09-14 07:41:48.440594
std-3	user-s3	ITC003	div-it-c	2	2025-09-14 07:41:48.440594
std-4	user-s4	CSA004	div-cs-a	2	2025-09-14 07:41:48.440594
std-5	user-s5	CSB005	div-cs-b	2	2025-09-14 07:41:48.440594
std-6	user-s6	CSC006	div-cs-c	2	2025-09-14 07:41:48.440594
std-7	user-s7	EXCSA007	div-excs-a	2	2025-09-14 07:41:48.440594
std-8	user-s8	EXCSB008	div-excs-b	2	2025-09-14 07:41:48.440594
std-9	user-s9	EXTCA009	div-extc-a	2	2025-09-14 07:41:48.440594
std-10	user-s10	EXTCB010	div-extc-b	2	2025-09-14 07:41:48.440594
std-11	user-s11	BMEA011	div-bme-a	2	2025-09-14 07:41:48.440594
std-12	user-s12	ITA012	div-it-a	3	2025-09-14 07:41:48.440594
std-13	user-s13	ITB013	div-it-b	3	2025-09-14 07:41:48.440594
std-14	user-s14	ITC014	div-it-c	3	2025-09-14 07:41:48.440594
std-15	user-s15	CSA015	div-cs-a	3	2025-09-14 07:41:48.440594
std-16	user-s16	CSB016	div-cs-b	3	2025-09-14 07:41:48.440594
std-17	user-s17	CSC017	div-cs-c	3	2025-09-14 07:41:48.440594
std-18	user-s18	EXCSA018	div-excs-a	3	2025-09-14 07:41:48.440594
std-19	user-s19	EXCSB019	div-excs-b	3	2025-09-14 07:41:48.440594
std-20	user-s20	EXTCA020	div-extc-a	3	2025-09-14 07:41:48.440594
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subjects (id, name, code, department_id, credits, type, created_at) FROM stdin;
subj-math	Mathematics	MATH101	\N	4	common	2025-09-14 07:41:48.440594
subj-eng	English	ENG101	\N	3	common	2025-09-14 07:41:48.440594
subj-phy	Physics	PHY101	\N	4	common	2025-09-14 07:41:48.440594
subj-db	Database Systems	IT201	dept-it	4	theory	2025-09-14 07:41:48.440594
subj-web	Web Development	IT202	dept-it	3	practical	2025-09-14 07:41:48.440594
subj-se	Software Engineering	IT203	dept-it	4	theory	2025-09-14 07:41:48.440594
subj-net	Computer Networks	IT204	dept-it	4	theory	2025-09-14 07:41:48.440594
subj-ds	Data Structures	CS201	dept-cs	4	theory	2025-09-14 07:41:48.440594
subj-algo	Algorithms	CS202	dept-cs	4	theory	2025-09-14 07:41:48.440594
subj-os	Operating Systems	CS203	dept-cs	4	theory	2025-09-14 07:41:48.440594
subj-prog	Programming Lab	CS204	dept-cs	2	practical	2025-09-14 07:41:48.440594
subj-de	Digital Electronics	EC201	dept-excs	4	theory	2025-09-14 07:41:48.440594
subj-micro	Microprocessors	EC202	dept-excs	4	theory	2025-09-14 07:41:48.440594
subj-vlsi	VLSI Design	EC203	dept-excs	3	practical	2025-09-14 07:41:48.440594
subj-comm	Communication Systems	ET201	dept-extc	4	theory	2025-09-14 07:41:48.440594
subj-signal	Signal Processing	ET202	dept-extc	4	theory	2025-09-14 07:41:48.440594
subj-security	Network Security	ET203	dept-extc	4	theory	2025-09-14 07:41:48.440594
subj-bio	Biomedical Engineering	BM201	dept-bme	4	theory	2025-09-14 07:41:48.440594
subj-devices	Medical Devices	BM202	dept-bme	3	practical	2025-09-14 07:41:48.440594
subj-biomech	Biomechanics	BM203	dept-bme	4	theory	2025-09-14 07:41:48.440594
\.


--
-- Data for Name: time_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.time_slots (id, name, start_time, end_time, is_active, created_at) FROM stdin;
slot-1	Slot 1	09:00:00	11:00:00	t	2025-09-14 07:41:48.440594
slot-2	Slot 2	11:15:00	13:15:00	t	2025-09-14 07:41:48.440594
slot-3	Slot 3	13:45:00	15:45:00	t	2025-09-14 07:41:48.440594
slot-4	Slot 4	16:00:00	18:00:00	t	2025-09-14 07:41:48.440594
\.


--
-- Data for Name: timetables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.timetables (id, division_id, subject_id, faculty_id, room_id, time_slot_id, day_of_week, is_active, created_at) FROM stdin;
e2e1c3c1-70f8-467f-8f42-845c22a7c7f5	div-it-a	subj-db	fac-1	room-101	slot-1	1	t	2025-09-14 07:41:48.440594
080acbe3-299d-4010-bbde-2e50dbf367ed	div-it-a	subj-web	fac-2	auditorium	slot-2	1	t	2025-09-14 07:41:48.440594
e7087a01-cf11-4e51-a6b5-89aec205eac1	div-it-a	subj-math	fac-1	room-101	slot-3	1	t	2025-09-14 07:41:48.440594
32ba2408-b91b-495e-b774-fb687b40f777	div-cs-a	subj-ds	fac-3	room-102	slot-1	1	t	2025-09-14 07:41:48.440594
8430f98f-6266-40d2-9b26-973566c0fb1b	div-cs-a	subj-algo	fac-3	room-102	slot-3	1	t	2025-09-14 07:41:48.440594
3a41cc51-fde9-4afb-af7a-2bb1e4e59a7e	div-excs-a	subj-de	fac-5	room-105	slot-2	1	t	2025-09-14 07:41:48.440594
5d5e8b6d-795f-44ed-9fce-33441915ddea	div-excs-a	subj-micro	fac-6	auditorium	slot-4	1	t	2025-09-14 07:41:48.440594
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, password_hash, role, created_at) FROM stdin;
user-f1	Dr. Smith	hashed_password	faculty	2025-09-14 07:41:48.440594
user-f2	Prof. Johnson	hashed_password	faculty	2025-09-14 07:41:48.440594
user-f3	Dr. Williams	hashed_password	faculty	2025-09-14 07:41:48.440594
user-f4	Dr. Chen	hashed_password	faculty	2025-09-14 07:41:48.440594
user-f5	Prof. Davis	hashed_password	faculty	2025-09-14 07:41:48.440594
user-f6	Dr. Wilson	hashed_password	faculty	2025-09-14 07:41:48.440594
user-f7	Prof. Miller	hashed_password	faculty	2025-09-14 07:41:48.440594
user-f8	Dr. Brown	hashed_password	faculty	2025-09-14 07:41:48.440594
user-f9	Prof. Garcia	hashed_password	faculty	2025-09-14 07:41:48.440594
user-f10	Dr. Martinez	hashed_password	faculty	2025-09-14 07:41:48.440594
user-admin	Administrator	hashed_password	admin	2025-09-14 07:41:48.440594
user-s1	Alice Johnson	hashed_password	student	2025-09-14 07:41:48.440594
user-s2	Bob Smith	hashed_password	student	2025-09-14 07:41:48.440594
user-s3	Carol Williams	hashed_password	student	2025-09-14 07:41:48.440594
user-s4	David Brown	hashed_password	student	2025-09-14 07:41:48.440594
user-s5	Eva Davis	hashed_password	student	2025-09-14 07:41:48.440594
user-s6	Frank Miller	hashed_password	student	2025-09-14 07:41:48.440594
user-s7	Grace Wilson	hashed_password	student	2025-09-14 07:41:48.440594
user-s8	Henry Moore	hashed_password	student	2025-09-14 07:41:48.440594
user-s9	Ivy Taylor	hashed_password	student	2025-09-14 07:41:48.440594
user-s10	Jack Anderson	hashed_password	student	2025-09-14 07:41:48.440594
user-s11	Kelly Thomas	hashed_password	student	2025-09-14 07:41:48.440594
user-s12	Liam Jackson	hashed_password	student	2025-09-14 07:41:48.440594
user-s13	Maya White	hashed_password	student	2025-09-14 07:41:48.440594
user-s14	Noah Harris	hashed_password	student	2025-09-14 07:41:48.440594
user-s15	Olivia Martin	hashed_password	student	2025-09-14 07:41:48.440594
user-s16	Paul Garcia	hashed_password	student	2025-09-14 07:41:48.440594
user-s17	Quinn Rodriguez	hashed_password	student	2025-09-14 07:41:48.440594
user-s18	Ruby Lewis	hashed_password	student	2025-09-14 07:41:48.440594
user-s19	Sam Robinson	hashed_password	student	2025-09-14 07:41:48.440594
user-s20	Tina Clark	hashed_password	student	2025-09-14 07:41:48.440594
\.


--
-- Name: departments departments_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_unique UNIQUE (code);


--
-- Name: departments departments_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_unique UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: divisions divisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_pkey PRIMARY KEY (id);


--
-- Name: faculty faculty_employee_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_employee_id_unique UNIQUE (employee_id);


--
-- Name: faculty faculty_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_name_unique UNIQUE (name);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: students students_roll_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_roll_number_unique UNIQUE (roll_number);


--
-- Name: subjects subjects_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_code_unique UNIQUE (code);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: time_slots time_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_pkey PRIMARY KEY (id);


--
-- Name: timetables timetables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_divisions_department_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_divisions_department_id ON public.divisions USING btree (department_id);


--
-- Name: idx_faculty_department_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_faculty_department_id ON public.faculty USING btree (department_id);


--
-- Name: idx_faculty_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_faculty_employee_id ON public.faculty USING btree (employee_id);


--
-- Name: idx_faculty_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_faculty_user_id ON public.faculty USING btree (user_id);


--
-- Name: idx_rooms_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rooms_is_active ON public.rooms USING btree (is_active);


--
-- Name: idx_students_division_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_students_division_id ON public.students USING btree (division_id);


--
-- Name: idx_students_roll_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_students_roll_number ON public.students USING btree (roll_number);


--
-- Name: idx_students_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_students_user_id ON public.students USING btree (user_id);


--
-- Name: idx_subjects_department_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subjects_department_id ON public.subjects USING btree (department_id);


--
-- Name: idx_time_slots_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_time_slots_is_active ON public.time_slots USING btree (is_active);


--
-- Name: idx_time_slots_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_time_slots_start_time ON public.time_slots USING btree (start_time);


--
-- Name: idx_timetables_day_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timetables_day_active ON public.timetables USING btree (day_of_week, is_active);


--
-- Name: idx_timetables_day_of_week; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timetables_day_of_week ON public.timetables USING btree (day_of_week);


--
-- Name: idx_timetables_division_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timetables_division_id ON public.timetables USING btree (division_id);


--
-- Name: idx_timetables_faculty_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timetables_faculty_id ON public.timetables USING btree (faculty_id);


--
-- Name: idx_timetables_faculty_unique_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_timetables_faculty_unique_active ON public.timetables USING btree (faculty_id, day_of_week, time_slot_id) WHERE (is_active = true);


--
-- Name: idx_timetables_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timetables_is_active ON public.timetables USING btree (is_active);


--
-- Name: idx_timetables_room_day; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timetables_room_day ON public.timetables USING btree (room_id, day_of_week, time_slot_id);


--
-- Name: idx_timetables_room_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timetables_room_id ON public.timetables USING btree (room_id);


--
-- Name: idx_timetables_room_unique_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_timetables_room_unique_active ON public.timetables USING btree (room_id, day_of_week, time_slot_id) WHERE (is_active = true);


--
-- Name: idx_timetables_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timetables_subject_id ON public.timetables USING btree (subject_id);


--
-- Name: idx_timetables_time_slot_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timetables_time_slot_id ON public.timetables USING btree (time_slot_id);


--
-- Name: idx_timetables_unique_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_timetables_unique_active ON public.timetables USING btree (division_id, day_of_week, time_slot_id) WHERE (is_active = true);


--
-- Name: timetables trigger_division_conflict; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_division_conflict BEFORE INSERT OR UPDATE ON public.timetables FOR EACH ROW WHEN ((new.is_active = true)) EXECUTE FUNCTION public.check_division_conflict();


--
-- Name: timetables trigger_faculty_conflict; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_faculty_conflict BEFORE INSERT OR UPDATE ON public.timetables FOR EACH ROW WHEN ((new.is_active = true)) EXECUTE FUNCTION public.check_faculty_conflict();


--
-- Name: timetables trigger_faculty_department; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_faculty_department BEFORE INSERT OR UPDATE ON public.timetables FOR EACH ROW EXECUTE FUNCTION public.check_faculty_department();


--
-- Name: timetables trigger_room_capacity; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_room_capacity BEFORE INSERT OR UPDATE ON public.timetables FOR EACH ROW EXECUTE FUNCTION public.check_room_capacity();


--
-- Name: timetables trigger_room_conflict; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_room_conflict BEFORE INSERT OR UPDATE ON public.timetables FOR EACH ROW WHEN ((new.is_active = true)) EXECUTE FUNCTION public.check_room_conflict();


--
-- Name: timetables trigger_subject_department; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_subject_department BEFORE INSERT OR UPDATE ON public.timetables FOR EACH ROW EXECUTE FUNCTION public.check_subject_department();


--
-- Name: divisions divisions_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: faculty faculty_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: faculty faculty_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: students students_division_id_divisions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_division_id_divisions_id_fk FOREIGN KEY (division_id) REFERENCES public.divisions(id);


--
-- Name: students students_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: subjects subjects_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: timetables timetables_division_id_divisions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_division_id_divisions_id_fk FOREIGN KEY (division_id) REFERENCES public.divisions(id);


--
-- Name: timetables timetables_faculty_id_faculty_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_faculty_id_faculty_id_fk FOREIGN KEY (faculty_id) REFERENCES public.faculty(id);


--
-- Name: timetables timetables_room_id_rooms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_room_id_rooms_id_fk FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- Name: timetables timetables_subject_id_subjects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_subject_id_subjects_id_fk FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: timetables timetables_time_slot_id_time_slots_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_time_slot_id_time_slots_id_fk FOREIGN KEY (time_slot_id) REFERENCES public.time_slots(id);


--
-- PostgreSQL database dump complete
--

