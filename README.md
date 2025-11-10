# Conversational English Course (B1) — Course Design Documentation

## Course Overview

**12-Week Conversational English Program (B1 Level)**

- **Cohort size:** 6–8 students
- **Schedule:** 12 weeks × 2 lessons/week × 60 minutes per lesson
- **Goals:** Build fluency, confidence, and equitable participation through topic-focused discussion, structured choice, and student-led presentations

## Pedagogical Design Philosophy

This course is designed around three core principles:

1. **Structured Choice:** Students make meaningful decisions that guide conversation paths, increasing engagement and ownership of learning
2. **Equitable Participation:** Built-in rotation systems and timeboxing ensure all students have equal speaking opportunities
3. **Meta-Level Reflection:** Regular reflection sessions help students develop awareness of their own language strategies and group dynamics

## Weekly Structure

Each week follows a consistent two-lesson pattern:

- **Lesson 1:** Choose-Your-Own-Adventure (CYOA) topic exploration
- **Lesson 2:** Two student presentations with guided 1-to-1 dialogues

### Lesson Timing

Every lesson follows this structure:

- **Warm-up (10 minutes):** Quick pair/share connected to the week's topic
- **Core activity (40 minutes):** Main lesson content (CYOA or Presentations)
- **Reflection (10 minutes):** Open, meta-level class discussion about strategies, language, and group dynamics (offline/analog)

## Weekly Topics

The course covers 12 diverse topics designed to engage B1-level learners:

1. Personal stories and identities
2. Community and civic life
3. Modern digital communication
4. Travel and cultural exchange
5. Health and wellness
6. Work and everyday problem-solving
7. Current news and local events
8. Future planning and goal setting
9. Art and music
10. Literature and storytelling
11. Environment and sustainability
12. Technology and society

## Lesson 1: Choose-Your-Own-Adventure (CYOA)

### Design Rationale

The CYOA format transforms passive discussion into active decision-making. Students collectively choose conversation paths, which:
- Increases engagement through ownership of direction
- Provides natural opportunities for negotiation and agreement
- Creates memorable conversation contexts
- Allows teachers to adapt pacing based on student interest

### How It Works

1. An image or video related to the week's topic is displayed
2. At each decision point, two path options appear (Path A and Path B)
3. The teacher selects an "initiator" student (rotated to ensure equity)
4. The class selects a path to see the prompt and vocabulary
5. The initiator reads the prompt to begin the conversation
6. Progress through 5–6 decision points (teacher may stop earlier if discussion is rich)
7. Vocabulary bank: 2–3 B1 words with definitions appear for each path
8. Path tracking: The system displays the selected path and trail of decisions

### Key Features

- **No backtracking:** Progress forward through selected branches (encourages commitment to choices)
- **Vocabulary integration:** Contextual vocabulary appears with each path, not as isolated lists
- **Visual support:** Media provides concrete context for abstract language practice
- **Flexible pacing:** Teachers can stop early if discussion is particularly rich

## Lesson 2: Student Presentations

### Design Rationale

Student-led presentations with structured dialogue modes:
- Build confidence through low-stakes public speaking
- Practice different conversational registers (business, academic, social, etc.)
- Create authentic contexts for 1-to-1 interaction
- Develop presentation skills alongside conversational skills

### How It Works

- **Two presenters per lesson** (20 minutes each)
- For each presenter:
  - **5 minutes:** Micro-presentation of chosen media (video or image)
  - Presenter selects conversation mode: business, academic, debate, artistic, social, technical, or creative
  - Class sees three pre-authored questions aligned to the selected mode
  - Students select and ask one question
  - **1-to-1 dialogues:** Each dialogue is 3 short exchanges, timeboxed to 5 minutes; repeat within time

### Rotation System

- With 6 students: Each presents 4× across 12 weeks
- With 8 students: Each presents 3× across 12 weeks
- Rotation is managed manually by the teacher

### Conversation Modes

The seven conversation modes expose students to different registers and contexts:
- **Business:** Professional, goal-oriented communication
- **Academic:** Analytical, evidence-based discussion
- **Debate:** Argumentative, structured disagreement
- **Artistic:** Creative, interpretive discussion
- **Social:** Casual, relationship-building conversation
- **Technical:** Precise, detail-focused explanation
- **Creative:** Imaginative, exploratory dialogue

## Participation and Equity Mechanisms

### Lesson 1 (CYOA)
- **Initiator rotation:** The "Change Student" button rotates initiators for each path change
- **Visible vocabulary bank:** Supports all students, not just confident speakers
- **Collective decision-making:** Path selection involves the whole class

### Lesson 2 (Presentations)
- **Timeboxed turns:** Each dialogue is strictly 5 minutes
- **Structured question selection:** Pre-authored questions reduce cognitive load
- **1-to-1 format:** Ensures every student has direct interaction time with presenters

## Technical Implementation

### Website Structure

The course website is a minimal, teacher-editable single-page application:
- **Technology:** HTML/CSS/vanilla JavaScript (no frameworks or dependencies)
- **Data:** Single `lessons.json` file contains all topics, branches, prompts, and vocabulary
- **Deployment:** Can run locally or be hosted on any static hosting service

### Key Utilities

- **Timer:** Timeboxed activities with pause/reset controls
- **Student selector:** Random rotation for initiators
- **Path tracking:** Visual display of conversation decisions
- **Media controls:** Image/video display with keyword search (Wikimedia Commons)

### Customization

Teachers can edit `lessons.json` to:
- Customize topics and weekly themes
- Modify conversation branches and prompts
- Adjust vocabulary lists
- Update student names
- Change timing durations

## Assessment and Reflection

### Reflection Topics

Students reflect on:
- What language strategies worked well?
- How did the group make decisions?
- What vocabulary was useful?
- How did the conversation flow?

## Content Moderation

**Important:** Teachers must ensure selected media is appropriate for their class. Online content may not be suitable for all learners. Use professional judgment when selecting images and videos.

The website provides tools for:
- Direct URL input (images or YouTube videos)
- Keyword search via Wikimedia Commons
- Image rotation from pre-selected sets

## Teacher Support

### Minimal Technology Requirements

- Single teacher device (laptop/tablet)
- Projector or large display
- Speakers (for video content)
- Internet connection (for media search)

### Teacher Responsibilities

- Manage presentation rotation schedule
- Select and moderate media content
- Rotate initiators in Lesson 1
- Facilitate reflection discussions
- Customize content via `lessons.json` as needed

### Flexibility

The course design allows teachers to:
- Stop CYOA early if discussion is rich
- Adjust timing based on class needs
- Customize topics to local context
- Integrate current events into weekly themes

## File Structure

```
course-website/
├── index.html          # Main application interface
├── script.js           # Application logic
├── styles.css          # Styling
├── lessons.json        # All course content (topics, prompts, vocabulary)
└── README.md          # This file
```

## Getting Started

1. Open `index.html` in a web browser
2. Review and customize `lessons.json` with your student names and any topic adjustments
3. Test the timer and media controls
4. Review the help modal (click the "?" button) for operational details
5. Begin with Week 1, Lesson 1

