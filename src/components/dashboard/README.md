# components/dashboard

Request-tracking dashboard components (the queue view lawyers work from).

Hard rule: no component in this directory, or anywhere else in this app, may display or collect
personal data of data subjects — names, documents, contact details, or any other personal data.
The `description` field is free text entered by requesters; it must never contain personal data,
and this warning is repeated wherever the field is shown. See root `CLAUDE.md` § Data
minimisation.
