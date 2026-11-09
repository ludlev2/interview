# Munch technical take-home

Thanks for doing this. There is one take-home of about three hours, plus three questions to think about before we talk. Please stop at three hours. We would rather see what you chose to do than everything done.

Use whatever tools you normally use, including AI. Everything in this exercise is fictional: the people, the stores and the numbers.

Clone this repository and work in `munch-market/`. Within a week, send us your copy with your commits (a link to a private repo or a zip), with `DECISIONS.md` and `AI_USAGE.md` in the root.

Afterwards we'll have a two-hour session. You'll walk us through your changes, we'll make a small change to your code together, and we'll discuss the questions at the end of this document. Nothing in that session will be a surprise.

## The take-home: Munch Market (about 3 hours)

Munch Market sells near-expiry and shelf-stable groceries online and ships them from our warehouse in one to five working days. A small team built the service in `munch-market/` quickly, with heavy use of AI coding tools. It works. Next month we want to put real traffic and a large supplier's stock through it. `munch-market/README.md` explains how to run it.

### 1. Make it production-ready, as far as you judge most important

Review the code as if you were about to own it. You won't have time to fix everything and we don't expect you to. Deciding what matters most is part of the exercise.

### 2. Ship the expiry rules the business has asked for

- Never deliver an item too close to expiry. Each category has a minimum number of days of shelf life that must remain on the day the order arrives (`category.min_days_on_arrival`). Delivery time depends on the carrier the customer picks.
- Sell the oldest stock first, wherever that rule allows.
- Discount stock as it approaches its best-before date: 20% off with 30 or fewer days left, 40% with 14 or fewer, 60% with 7 or fewer. The price a customer sees must be the price they pay.
- Never sell stock we don't have, including when many customers order the same product at the same moment.

Some of these rules interact in ways that need a product decision. Make the call, implement it and explain it.

Ground rules, so you don't spend time on them:

- Dates and "today" are in Budapest time. Working days are Monday to Friday; ignore public holidays.
- Prices are charged in whole forints.
- You don't need to migrate existing data. The seed script recreates everything, and changing the schema is fine.

### What to send back

- Your commits, made as you would at work. A test that fails without your change is worth more than many tests.
- `DECISIONS.md`, one or two pages: the risks you found, ranked, with what you fixed and what you left and why; your decisions on the expiry rules; what you would do next with another week.
- `AI_USAGE.md`, half a page: which tools you used and how, one place AI helped, and one place it was wrong or misleading and how you noticed.

## Before we talk

No written answers needed. We'll discuss these in the session. There are no right answers: we're interested in what you'd ask first and how you weigh the options. Where something needs facts we haven't given you, make an assumption and say what it is.

1. **Moving to AWS.** Munch has decided to move from Google Cloud to AWS. AWS has offered free credits, and the Google Cloud bill is high. Today the core runs as services on Google Cloud, and analytics runs on BigQuery. You're the tech lead and you own the migration. How would you approach it? What would you move first, what would you change along the way and what would you leave as it is, and how would you keep the product running and shipping while it happens?
2. **Drop night.** Munch stores post surprise bags of surplus food that go on sale at a set time, and popular ones sell out in seconds.
   - a) Say 5,000 people try to reserve the same 10 bags in the same second. How would you design the reservation path so it stays correct and fast? Could it run on serverless infrastructure, and what would you keep on always-on servers? What would worry you most?
   - b) Customers say the popular bags are rigged, and the CEO asks whether to switch to a lottery. Growth has already promised Club members (a paid subscription) 15 minutes of early access. A hotel partner says its regulars would hate a raffle. Meanwhile, bakeries say their bags don't sell and they might leave. What would you do in the next few weeks, and what data would you want before deciding? We'll answer data questions in the session.
3. **AI across engineering and the company.** What makes a codebase and an engineering team effective with coding agents, and what would you change in your first quarter? Outside engineering, several of the company's websites and small apps are built by non-engineers with AI app builders, each with its own database; one collects customer emails. What would you keep, what would you put guardrails on, and what would you let people build? How would you know any of this is working, beyond the amount of code produced?
