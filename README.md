# Andreevskoye interactive demo

Public GitHub Pages entry for a password-encrypted architectural viewer.

The login and password derive an AES-256-GCM decryption key in the visitor's browser using PBKDF2-SHA-256 (600,000 iterations, fresh random 32-byte salt and 12-byte IV). The repository contains ciphertext, not the original model or the credentials. An incorrect login, password or modified ciphertext will not decrypt successfully.

After unlocking, the viewer exists in browser memory. Reloading or using «Закрыть модель» returns to the entry screen. Credentials and decrypted content are not stored by this application in localStorage, sessionStorage, cookies or service workers.

This is client-side encryption for a static demo, not server-side account management or DRM. Anyone who possesses the credentials can save the decrypted content. Published ciphertext can be retained by others and subjected to offline password guesses; use a long random password. Changing a future release's password does not revoke copies of older ciphertext or data already decrypted.

Only the entry page, its styles/scripts, public encryption parameters and encrypted payload belong in this repository. Model sources, PDFs, Blender files, exports, build scripts and credentials are kept outside it. The architectural line drawing on the entry screen is a generic decorative illustration.
