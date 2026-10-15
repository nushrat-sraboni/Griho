# CLAUDE.local.example.md

This is a TEMPLATE (a blank form). It is shared with the whole team and has no
private information in it.

Every teammate needs their own private file called `CLAUDE.local.md`. That file
stays on their own computer and is never shared (it is listed in `.gitignore`).
It tells Claude who the person is and which language they like.

---

## Instructions for Claude (read this if `CLAUDE.local.md` is missing)

If the person says something like "make my local file" or "set me up", or if
`CLAUDE.local.md` does not exist yet, create it like this:

1. **Ask the person three things.** Use multiple-choice questions, and use very
   simple words (see the simple-language rule in `CLAUDE.md`).
   1. **Who are you?** Options: Bishal, Sraboni, Shafin.
   2. **Which language should I speak with you?** Options: English, Bengali in
      Bengali letters (বাংলা), Bengali in English letters (Banglish), or
      "Other" (they type it).
   3. *(Only if they chose "Other" above)* Which language exactly?
2. **Copy the template below** into a new file named `CLAUDE.local.md` in the
   top folder of the project. Fill in the blanks from their answers. Use the
   lane table to fill in their part of the project.
3. **Never overwrite** an existing `CLAUDE.local.md` without asking first.
4. **Never commit or share it.** Check that `.gitignore` still lists
   `CLAUDE.local.md`. If it does not, tell the person.
5. **Tell the person, in simple words,** what you created and where it is.

Lane table (who does what):

| Person | Their part | Their lane |
|---|---|---|
| Bishal | Griho Home (owners and tenants) | `apps/home/` |
| Sraboni | Griho Staff (managers and guards) | `apps/staff/` |
| Shafin | Backend and team setup | `supabase/`, `packages/shared/`, `docs/`, top-level files |

---

## The template (copy everything below this line into `CLAUDE.local.md`)

```markdown
# CLAUDE.local.md

This is a PRIVATE file. It lives only on my computer and is never saved into
the shared project history (it is listed in `.gitignore`).

## Who I am

- My name is **<NAME>**.
- My part of the project is **<MY PART>** (see "Team and Lanes" in `CLAUDE.md`).
- My lane (the only folders I may change) is **<MY LANE>**.

## Language

- Always speak with me in **<LANGUAGE>**, no matter which language I write to
  you in.
- Keep it simple. The simple-language rules in `CLAUDE.md` still apply.
- Code, file names, commands, and commit messages stay in English.
```
