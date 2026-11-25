# platform-course

Ten chapters built from a real client interview sheet: Kubernetes, Linux
administration, ports and firewalls, ingress and L4/L7, SSO/SAML/OAuth/RBAC,
REST integration, WebSockets, on-prem deployment, HA and disaster recovery.

The premise is that the panel was asking one question in thirty-three forms:
**trace the request, and name the broken link.** Chapter 1 is that path; every
later chapter is one link enlarged.

Each chapter has an everyday analogy, a short "in the room, say this" sentence
to actually speak, and questions with explanations — not just answers. Four
chapters have interactive pieces: a request-path explorer, a searchable port
reference, an L4/L7 comparison, and a `kubectl describe` event reader.

Progress is stored in `localStorage` under `pc.v1`; nothing is sent anywhere.

Run locally: `python3 -m http.server 8951` and open <http://127.0.0.1:8951/>.

Honest scope: this teaches the vocabulary and the debugging method well enough
to hold a conversation. It does not make anyone a Kubernetes administrator —
that needs a cluster you can break, which is why the README of the interview
prep says to build one with k3d.
