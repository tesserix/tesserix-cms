# Editing the YES Hospital website

Website content (doctors, departments, OPD timings, phone numbers, FAQs, insurance) is
edited at **https://cms.tesserix.app/admin**. No change reaches the website until an
Approver publishes it. Once published, it appears within a minute.

## Who does what

| | Editor | Approver |
|---|---|---|
| Edit anything and save it as a draft | Yes | Yes |
| Upload photos | Yes | Yes |
| Publish (make it live), unpublish | No | Yes |
| Delete | No | Yes |
| Change a page's web address (slug) once it has been live | No | Yes |
| Add or remove Editors and Approvers | No | Yes |

## Logging in

- Sign in with your email and password.
- **Forgot your password?** Use "Forgot password?" on the login page, or go to
  https://cms.tesserix.app/admin/forgot. An email with a reset link arrives within a minute;
  check spam if it doesn't.
- Five wrong passwords lock the account for 15 minutes.

## Editors: making a change

1. Open the section in the left menu (for example **Doctors**) and click the item.
2. Make the change. For example, put OPD timings in **Opd** as `Mon-Sat, 10am-2pm`.
3. Click **Save Draft**.

The website does not change yet. The Approvers get an email saying a change is waiting.
The list shows the item as **Changed** (a draft waiting) or **Published** (live as it is).

If an Approver leaves a **Review note** (right-hand side of the item) instead of publishing,
read it, fix the draft, and save again.

### Common tasks

- **New doctor:** Doctors → **Create New**. Fill in name, department, qualification and
  languages. The web address is made from the name.
- **Doctor has left:** untick **Active** and save the draft. Once published, the doctor
  disappears from every page. Nothing is deleted, so they can be brought back the same way.
- **Photo:** in the doctor's **Photo** field, upload a JPEG, PNG or WebP under 5 MB, and
  describe it in **Alt** (for example "Dr. Kriti Sahu"). Portrait photos look best.
- **Phone numbers, address, about text:** **Hospital info**.

## Approvers: publishing

1. Open the item from the email link, or from the list (look for **Changed**).
2. To see what changed, open the **Versions** tab and compare the draft with the
   published version. **Updated by** on the right shows who saved it.
3. Then do one of these:
   - **Publish changes** to make it live.
   - Write a **Review note** for the Editor and leave it unpublished.
   - Restore the published version from **Versions** to throw the draft away.

A doctor can only be published if their department is published.

**Changing a web address:** only an Approver can change the **Slug** of a page that has been
live. The old address keeps working and forwards to the new one.

**Users:** Approvers add Editors and other Approvers under **Users**, for this hospital only.
New users set their password with "Forgot password?".

## Help

If something looks wrong on the website after publishing, wait a minute and reload. If it
still looks wrong, or you are locked out, email the Tesserix team.

## The Tesserix website (tesserix.app)

The same CMS holds the content of the Tesserix company site, under the **Tesserix** group in
the left menu (visible only to Tesserix users). The roles and the draft → publish flow above
apply unchanged. Once published, a change is on tesserix.app within a minute.

| Section | What it is on the site |
|---|---|
| **Products** | Every product page under /products, the homepage product stack, the navbar menu, the footer links and the contact form's product list. |
| **Team members** | "Who we are" on /about. |
| **Principles** | "How we work" on /about and "What we look for" on /careers; numbered by position. |
| **Beliefs** | The three "what we believe" cards on the homepage. |
| **Open-source projects** | The open-source strip on the homepage; the link is github.com/tesserix/<name>. |

Things to know:

- **Order** (right-hand side) decides position everywhere: lower comes first. The order of
  Products is also the order in which the industries are listed in the hero and footer.
- **Status** on a product is the launch switch. Flipping it to **Available** and publishing
  puts the product live on the site, and the site then emails everyone on that product's
  waitlist. Only do this when the product is really available.
- **ETA** on a coming-soon product is shown on the homepage. Leave it empty rather than guess.
- **Site image** and **Screenshots** are shown for available products only. Upload the real
  thing: a landscape capture of the live site, and two or three portrait phone screenshots.
- **Listings**: add an App Store or Google Play row with the store URL. Leave the URL empty for
  a listing that exists but is not live yet (for example an iOS app under review); the site
  shows a "coming soon" badge instead of a dead link.
- **Icons** are picked from a fixed list; the site renders a generic box for anything it does
  not recognise, so a newer icon needs a site release first.
- If the CMS is ever unreachable, the site keeps serving the content it was built with; it
  does not go blank.
