SITE-19 AUTOMATIC BACKEND PACK

1) APPS SCRIPT:
Replace the entire Code.gs with the included Code.gs.
Save it.
Then Deploy > Manage deployments > Edit (pencil) > New version > Deploy.
Keep Execute as: Me
Keep access: Anyone

IMPORTANT: editing Code.gs alone does NOT update the live /exec deployment until you deploy a new version.

2) GITHUB:
Upload/replace:
- index.html
- id.html
- credential_fabricator_o5_v11_auto.html
- site19.js
- styles.css

Keep all your other existing app HTML files.

HOW IT WORKS:
- Scanner automatically calls:
  https://script.google.com/macros/s/AKfycby8D8HsOIAMlaQm6sIq-JEeUefZyvdleREYJN8jKeFBkfdOmreUhvoC__kZGPgm2UCpHw/exec
- Valid backend card -> server returns clearance + a 15-minute backend session.
- O5 opens Credential Fabricator.
- Choose clearance and press ISSUE BACKEND CREDENTIAL.
- Backend verifies the O5 session, generates the random credential token, stores it privately, and returns it.
- Fabricator automatically puts S19TOKEN|<token> into the QR.
- Names/photos are never sent to the backend by these files.

Your existing manually-registered bootstrap O5 token remains valid.
