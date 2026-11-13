import { ContactKind } from '../../src/generated/prisma/enums';
import { profileSeed } from '../../src/seed/seed.data';

describe('profileSeed', () => {
  it('fills every required profile field', () => {
    expect(profileSeed.name).toBeTruthy();
    expect(profileSeed.headline).toBeTruthy();
    expect(profileSeed.description.length).toBeGreaterThan(80);
    expect(profileSeed.isPrimary).toBe(true);
    expect(profileSeed.contacts.length).toBeGreaterThan(0);
    expect(profileSeed.skills.length).toBeGreaterThan(0);
    expect(profileSeed.experience.length).toBeGreaterThan(0);
    expect(profileSeed.projects.length).toBeGreaterThan(0);
  });

  it('has unique skills and contact links', () => {
    const skillNames = profileSeed.skills.map((skill) => skill.name);
    const contactUrls = profileSeed.contacts.map((contact) => contact.url);

    expect(new Set(skillNames).size).toBe(skillNames.length);
    expect(new Set(contactUrls).size).toBe(contactUrls.length);
    expect(profileSeed.contacts.some((contact) => contact.kind === ContactKind.GITHUB)).toBe(true);
  });

  it('keeps experience ordered from newest to oldest with valid periods', () => {
    const starts = profileSeed.experience.map((item) => item.startDate.getTime());
    expect(starts).toEqual([...starts].sort((left, right) => right - left));

    for (const item of profileSeed.experience) {
      expect(item.company).toBeTruthy();
      expect(item.position).toBeTruthy();
      expect(item.achievements.length).toBeGreaterThan(0);

      if (item.endDate) {
        expect(item.endDate.getTime()).toBeGreaterThanOrEqual(item.startDate.getTime());
      }
    }
  });

  it('uses unique slugs and https links for projects', () => {
    const slugs = profileSeed.projects.map((project) => project.slug);

    expect(new Set(slugs).size).toBe(slugs.length);

    for (const project of profileSeed.projects) {
      expect(project.url).toMatch(/^https:\/\//);
      expect(project.tags.length).toBeGreaterThan(0);
    }
  });

  it('uses absolute links for contacts', () => {
    for (const contact of profileSeed.contacts) {
      expect(contact.url).toMatch(/^https:\/\/|^mailto:/);
    }
  });
});
