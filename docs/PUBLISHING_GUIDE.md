# Publishing guide

How posts get onto Future Pathways (https://futurepathways.github.io). Written for Madan Kumar PC, who runs the site, and for any collaborator he gives access to. No code, no Git: Pages CMS saves straight to the website's files, and the site rebuilds itself within about two minutes of every save.

> **Rule for every post, even a draft:** never put private information in it. No student names, phone numbers, fees paid by a family, or internal notes. The website's files are public.

## 1. One-time setup

1. Go to https://app.pagescms.org, sign in with GitHub, choose the repository **futurepathways/futurepathways.github.io**, and when GitHub asks, install the Pages CMS app on that repository.
2. To let a collaborator publish: invite their GitHub account to the **futurepathways** organisation with the **Member** role, give them **Write** access on the repository, and they sign in to Pages CMS with their own account.

[Screenshot: Pages CMS home after signing in]

## 2. What you see in Pages CMS

| Menu item | What it is |
|---|---|
| Careers, Internships & Opportunities, Courses, Countries, Universities | The five post categories. One list of posts each. |
| Career Roadmaps | The data behind the Roadmaps tool: families, filter options and one entry per role. |
| Tags: Subject area, Entrance exam, Skill, Study level, Audience | The tag lists, one per group. |
| Countries (list) | The country list used for the Countries filter. |
| Start here by grade | The intros and "read these first" lists on the three grade pages. |
| Media | Pictures uploaded for posts. |

## 3. Add a new post

1. Open the category (for example **Careers**). Click **Add entry**.
2. **File name:** a short web address in lowercase with hyphens, for example `becoming-a-doctor`. This becomes the page address, so keep it short and never change it later.
3. Fill the form top to bottom. Every field has a hint under it. The ones people miss:
   - **Grade band:** pick at least one.
   - **Tags:** at least one Subject area tag, and 3 to 8 tags in total across the five tag fields. Start typing to search a list.
   - **For Parents box:** 2 to 4 plain sentences ending with a question for the family to ask a counsellor.
   - **Key dates:** any application, test or decision dates in the post. They appear on the post, on its card and on the Deadlines page.
   - **Checked by:** who checked the facts. Do not publish without a name here.
   - **Last checked** and **Published on:** dates.
   - **Status:** leave as **Draft** until the post is checked.
4. **Post text:** write or paste under the headings of the category template (see Section 10). Use the toolbar for headings (Heading 2 for each section), bullet lists and links.
5. Click **Save**. The draft is saved to the website's files but is not shown on the site.

## 4. Publish a post

Open the post, change **Status** to **Published (live)**, check **Published on**, and click **Save**. After about two minutes the post appears on the site. If it does not appear after five minutes, see Section 9.

## 5. Edit a post

Open the post, change what you need, click **Save**. If you corrected facts, update **Last checked** too. The address never changes, so links already shared keep working.

## 6. Unpublish or remove a post

- To hide a post but keep it: set **Status** back to **Draft** and save.
- To remove it: open the post and use **Delete** at the bottom. Links to it stop working, so prefer Draft.

## 7. Update a yearly opportunity

Olympiads, summer programmes and other events that repeat each year keep **one post**. Each year, update **Deadline**, **Event dates**, **Key dates**, **Last checked** and any changed fees, then save. Do not create a second post for the new year.

## 8. Add a tag or a country

1. Open the right tag group (for example **Tags: Entrance exam**) or **Countries (list)**. Click **Add entry**.
2. **Slug / file name:** lowercase letters and hyphens, for example `gmat`. Never change it later.
3. **Tag name:** what students see, for example `GMAT`.
4. **One line description:** shown on the tag page.
5. **Search words:** other words students might type, one per line.
6. Save. The tag is available in post forms straight away. It appears on the Browse All Tags page once a published post uses it.

Rules: a tag belongs to exactly one group; check the list first so you do not create a near duplicate. Tags with no posts are removed from time to time, so add a tag when a post needs it, not before.

## 9. If something goes wrong

| What you see | What to do |
|---|---|
| The post does not appear after five minutes | On github.com open the repository, then **Actions**. The latest run shows a red cross if the build failed. Click it and read the message: it names the post and the problem, for example "has only 2 tags; it needs at least 3". Fix the post in Pages CMS and save again. |
| "Required" error when saving | A required field is empty. The form marks it. |
| A tag or country is missing from the list | Add it (Section 8), then come back to the post. |
| The site shows an old version | Wait two more minutes and reload. The site also rebuilds every morning at 5:00 IST. |

## 10. The Word templates

Guest writers can draft in Word using the template for the category: `docs/templates/FP-post-template-<category>.docx`. The templates carry the fields in Section 3 and the headings for each category, so a finished draft maps straight onto the form.
