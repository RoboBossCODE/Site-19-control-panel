SITE-19 O5 AUTH CONSISTENCY FIX - V12

WHAT CHANGED
- Every O5 app now uses the same shared O5 authorization rule.
- O5 UI access requires:
    1) local clearance O5
    2) a backend-verified O5 card has been scanned
- The Credential Fabricator no longer locks simply because the short-lived issue session expired.
- The short-lived backend session is only required when issuing a NEW backend credential.
- If the issue session expires, scan your O5 card again, return to the Fabricator, and issue the card.
- Ending the Site-19 session clears the backend O5 marker and backend session.

APPS SCRIPT
No new Code.gs changes are required beyond the Code.gs already included here.
If you have already deployed that automatic-backend Code.gs version, you do not need to redeploy for this specific UI-auth fix.

GITHUB
Upload/replace:
- index.html
- id.html
- site19.js
- styles.css
- credential_fabricator_o5_v11_auto.html

Keep all other Site-19 app files.
The Fabricator filename stays credential_fabricator_o5_v11_auto.html so index.html continues to reference it correctly.

EXPECTED FLOW
1. Scan backend O5 card.
2. Backend verifies it.
3. Dashboard displays every O5 app.
4. Every O5 app accepts the same verified O5 state.
5. Credential Fabricator opens normally.
6. ISSUE BACKEND CREDENTIAL additionally requires the short-lived server session.
