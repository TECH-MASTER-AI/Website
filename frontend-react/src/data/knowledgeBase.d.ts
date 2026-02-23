/**
 * TypeScript declarations for knowledgeBase.js
 */

export interface TeamMember {
  name: string;
  role: string;
  email: string;
  linkedin: string;
  photo: string;
  bio: string;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  mission: string;
  vision: string;
  founded: string;
  headquarters: string;
  website: string;
  email: string;
}

export interface KnowledgeBase {
  company: CompanyInfo;
  team: {
    founder: TeamMember;
    ceo: TeamMember;
    managingDirector: TeamMember;
    cmo: TeamMember;
    cto: TeamMember;
  };
  features: Array<{
    name: string;
    description: string;
    icon: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
    category: string;
  }>;
  contact: {
    email: string;
    phone: string;
    address: string;
    socialMedia: {
      linkedin: string;
      twitter: string;
      github: string;
    };
  };
}

export declare const TECHMASTERAI_KNOWLEDGE: KnowledgeBase;

export declare function searchKnowledgeBase(query: string): string | null;