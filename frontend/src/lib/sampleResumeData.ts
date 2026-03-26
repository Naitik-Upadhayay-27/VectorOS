import type { TemplateResumeData } from '@/types/resume'

export const sampleData: TemplateResumeData = {
  personalInfo: {
    name: 'Alex Johnson',
    title: 'Senior Software Engineer',
    contact: {
      email: 'alex.johnson@email.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexjohnson',
      github: 'github.com/alexjohnson',
    },
  },
  summary:
    'Results-driven software engineer with 6+ years of experience building scalable web applications. Passionate about clean code, system design, and delivering impactful products.',
  experience: [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Stripe',
      location: 'San Francisco, CA',
      startDate: 'Jan 2022',
      endDate: 'Present',
      description: [
        'Led development of payment infrastructure serving 10M+ transactions/day',
        'Reduced API latency by 40% through caching and query optimization',
        'Mentored 4 junior engineers and conducted 50+ technical interviews',
      ],
    },
    {
      id: '2',
      title: 'Software Engineer',
      company: 'Notion',
      location: 'Remote',
      startDate: 'Jun 2019',
      endDate: 'Dec 2021',
      description: [
        'Built real-time collaboration features used by 2M+ daily active users',
        'Migrated legacy REST APIs to GraphQL, reducing payload size by 35%',
        'Improved test coverage from 42% to 87% across core modules',
      ],
    },
  ],
  education: [
    {
      id: '1',
      degree: 'B.S. Computer Science',
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      graduationDate: 'May 2019',
      gpa: '3.8',
      description: ['Dean\'s List 2017–2019', 'ACM Club President'],
    },
  ],
  skills: [
    { id: '1', category: 'Frontend', skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'] },
    { id: '2', category: 'Backend', skills: ['Node.js', 'Python', 'PostgreSQL', 'Redis'] },
    { id: '3', category: 'DevOps', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'] },
  ],
  projects: [
    {
      id: '1',
      name: 'JobOS — AI Job Platform',
      role: 'Lead Developer',
      link: 'github.com/alex/jobos',
      startDate: 'Jan 2024',
      endDate: 'Present',
      description: ['Built AI-powered resume optimizer with 95% ATS pass rate', 'Integrated GPT-4 for real-time resume coaching'],
      technologies: ['React', 'Node.js', 'OpenAI', 'PostgreSQL'],
    },
  ],
  certificates: [
    { id: '1', name: 'AWS Solutions Architect', issuer: 'Amazon Web Services', date: 'Mar 2023' },
    { id: '2', name: 'Google Cloud Professional', issuer: 'Google', date: 'Nov 2022' },
  ],
  awards: [
    { id: '1', title: 'Engineer of the Year', date: '2023', description: 'Recognized for outstanding contributions to platform reliability.' },
  ],
  languages: [
    { id: '1', language: 'English', proficiency: 'Native' },
    { id: '2', language: 'Spanish', proficiency: 'Conversational' },
  ],
  volunteer: [
    { id: '1', role: 'Technical Mentor', organization: 'Code.org', startDate: 'Sep 2021', endDate: 'Present', description: 'Mentoring underrepresented students in web development.' },
  ],
}
