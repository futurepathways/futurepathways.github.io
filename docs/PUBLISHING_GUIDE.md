# Publishing guide for Niranjan

How to put a counsellor's draft on Future Pathways (https://futurepathways.github.io) using Pages CMS. No code, no Git. The site rebuilds itself within about two minutes of every save.

> **Rule for every post, even a draft:** never put private information in it. No student names, phone numbers, fees paid by a family, or internal notes. The website's files are public.

## 1. One-time setup (Madan does this once)

1. Create a GitHub account for Niranjan (his own email, two-factor on).
2. On github.com, open the organisation **futurepathways** → **People** → **Invite member** → add Niranjan with the **Member** role. Then on the repository **futurepathways.github.io** → **Settings** → **Collaborators and teams** → give Niranjan **Write** access.
3. Go to https://app.pagescms.org, sign in with GitHub, choose the repository **futurepathways/futurepathways.github.io**, and when GitHub asks, install the Pages CMS app on that repository. Niranjan then signs in at the same address with his own GitHub account.

[Screenshot: Pages CMS home after signing in, showing the Future Pathways repository]

## 2. What you see in Pages CMS

The left menu lists:

| Menu item | What it is |
|---|---|
| Careers, Internships & Opportunities, Courses, Countries, Universities | The five post categories. One list of posts each. |
| Tags: Subject area, Entrance exam, Skill, Study level, Audience | The tag lists, one per group. |
| Countries (list) | The country list used for the Countries filter. |
| Start here by grade | The intros and "read these first" lists on the three grade pages. |
| Media | Pictures uploaded for posts. |

[Screenshot: the left menu]

## 3. Add a new post

1. Open the category the counsellor chose (for example **Careers**). Click **Add entry**.
2. **File name:** type a short web address for the post in lowercase with hyphens, for example `becoming-a-doctor`. This becomes the page address, so keep it short and never change it later.
3. Fill the form from the counsellor's Word draft, top to bottom. Every field has a hint under it. The ones people miss:
   - **Grade band:** pick at least one.
   - **Tags:** at least one Subject area tag, and 3 to 8 tags in total across the five tag fields. Start typing to search a list.
   - **For Parents box:** 2 to 4 plain sentences.
   - **Checked by:** the counsellor who checked the facts. Do not publish a post without a name here.
   - **Last checked** and **Published on:** dates.
   - **Status:** leave as **Draft** until the post is checked.
4. **Post text:** paste the counsellor's text under the same headings as the Word template. Use the toolbar for headings (Heading 2 for each section), bullet lists and links. Tables can be pasted from Word.
5. Click **Save**. The draft is saved to the website's files but is not shown on the site.

[Screenshot: the post form with the Tags fields]

## 4. Publish a post

1. Open the post, change **Status** to **Published (live)**, check **Published on** is today, and click **Save**.
2. After about two minutes, open https://futurepathways.github.io and find the post in its category. If it is not there after five minutes, see Section 9.

## 5. Edit a post

Open the post, change what you need, click **Save**. If you corrected facts, update **Last checked** too. The address of the post never changes, so links already shared keep working.

## 6. Unpublish or remove a post

- To hide a post but keep it: set **Status** back to **Draft** and save.
- To remove it: open the post and use **Delete** at the bottom. Links to it will stop working, so prefer Draft unless Madan says delete.

## 7. Update a yearly opportunity

Olympiads, summer programmes and other events that repeat each year keep **one post**. Each year, open the post and update **Deadline**, **Event dates**, **Last checked** and any changed fees, then save. Do not create a second post for the new year.

## 8. Add a tag or a country

1. Open the right tag group (for example **Tags: Entrance exam**) or **Countries (list)**. Click **Add entry**.
2. **Slug / file name:** lowercase letters and hyphens, for example `gmat`. Never change it later.
3. **Tag name:** what students see, for example `GMAT`.
4. **One line description:** shown on the tag page.
5. **Search words:** other words students might type, one per line, for example `management entrance`.
6. Save. The tag is available in post forms straight away. It appears on the Browse All Tags page once a published post uses it.

Rules: pick the right group; a tag belongs to exactly one group. Check the list first so you do not create a near duplicate ("AI" and "Artificial intelligence").

## 9. If something goes wrong

| What you see | What to do |
|---|---|
| The post does not appear after five minutes | On github.com open the repository → **Actions**. The latest run shows a red cross if the build failed. Click it and read the message: it names the post and the problem, for example "has only 2 tags; it needs at least 3". Fix the post in Pages CMS and save again. |
| "Required" error when saving | A required field is empty. The form marks it. |
| A tag or country is missing from the list | Add it (Section 8), then come back to the post. |
| The site shows an old version | Wait two more minutes and reload. The site also rebuilds every morning at 5:00. |

Anything else: write to Madan.

## 10. The Word templates

Counsellors write drafts in Word using the template for the category: `docs/templates/FP-post-template-<category>.docx`. The templates carry the fields in Section 3 and the headings for each category, so a finished draft maps straight onto the form.
