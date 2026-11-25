window.COURSE = [
 {
  "id": "path",
  "num": "01",
  "title": "How one request travels",
  "hook": "Half the questions on that sheet are really this one question, asked from different angles: what happens between typing a URL and seeing a page?",
  "sentence": "A request walks a chain \u2014 DNS, network, load balancer, proxy, app, database \u2014 and every troubleshooting question is 'which link broke?'",
  "analogy": "Posting a letter. You need the address (DNS), roads (routing), a sorting office (load balancer), a receptionist (reverse proxy), the right department (app), and the filing cabinet (database).",
  "sections": [
   [
    "DNS",
    "The name is turned into an IP address. If DNS fails you get 'server not found' \u2014 not a timeout."
   ],
   [
    "Route and port",
    "Your machine opens a connection to that IP on a port (443 for HTTPS). A closed port gives 'connection refused'; a filtered one hangs until timeout."
   ],
   [
    "Load balancer",
    "Distributes across several servers. L4 balances packets, L7 understands HTTP and can route by path or host."
   ],
   [
    "Reverse proxy",
    "Sits in front of the app: TLS termination, compression, headers, sometimes caching. nginx is the usual one."
   ],
   [
    "Application",
    "Your code. It validates, calls the database, and answers with a status code."
   ],
   [
    "Database",
    "Slow queries look like a slow app; a locked table looks like a hang."
   ]
  ],
  "code": "curl -v https://app.example.com/health\n# look at: DNS resolved? TCP connected? TLS ok? status code? time spent?",
  "say": "\"I walk the path in order \u2014 DNS, TCP, TLS, HTTP, app, dependency \u2014 because each failure has a distinct symptom. Timeout is different from refused, and refused is different from a 502.\"",
  "quiz": [
   {
    "q": "A browser shows 'connection refused' rather than hanging forever. What does that tell you?",
    "o": [
     "DNS is broken",
     "Something answered and said no on that port",
     "TLS certificate expired",
     "The database is down"
    ],
    "a": 1,
    "why": "Refused means a host was reached and the port is closed or actively rejecting \u2014 the network worked."
   },
   {
    "q": "The app returns 502 Bad Gateway. Which component is most likely reporting it?",
    "o": [
     "The browser",
     "The reverse proxy/LB, because the backend did not answer properly",
     "The database",
     "DNS"
    ],
    "a": 1,
    "why": "502 is produced by the proxy when the upstream failed to give a valid response."
   }
  ]
 },
 {
  "id": "ports",
  "num": "02",
  "title": "Ports and the OSI layers",
  "hook": "Three interviewers asked about ports, and two asked about OSI. It is a cheap question they use to check you are not bluffing.",
  "sentence": "A port is which door on the machine; an OSI layer is which level of the journey you are looking at.",
  "analogy": "A building: the IP is the street address, the port is the flat number. OSI is the difference between the postal service (network), the building manager (transport) and the person reading the letter (application).",
  "sections": [
   [
    "Port ranges",
    "0\u20131023 privileged (22 SSH, 80 HTTP, 443 HTTPS, 53 DNS). 1024\u201349151 registered (3000 dev, 3306 MySQL, 5432 Postgres, 8080 alt-HTTP). 49152\u201365535 ephemeral \u2014 your outbound connections get one of these."
   ],
   [
    "Kubernetes ports worth knowing",
    "6443 API server, 2379/2380 etcd, 10250 kubelet, 10257/10259 controllers, 30000\u201332767 NodePort range."
   ],
   [
    "OSI in one line each",
    "1 Physical (cable) \u00b7 2 Data link (MAC, switch) \u00b7 3 Network (IP, router) \u00b7 4 Transport (TCP/UDP, port) \u00b7 5 Session \u00b7 6 Presentation (TLS, encoding) \u00b7 7 Application (HTTP)."
   ],
   [
    "Why they ask",
    "So they can say 'we see a 502, what layer?' and hear you answer 'seven, the proxy reached the app but got nothing usable'."
   ]
  ],
  "code": "ss -lntp        # what is listening, on which port, by which process\ndf -i            # inodes: 'no space' when the disk looks empty\\n",
  "say": "\"Ports tell me where to knock; OSI tells me which tool to reach for \u2014 ping and traceroute are layer 3, nc is layer 4, curl and openssl are 6 and 7.\"",
  "quiz": [
   {
    "q": "Which port does the Kubernetes API server listen on?",
    "o": [
     "8080",
     "6443",
     "3306",
     "10250"
    ],
    "a": 1,
    "why": "6443 is the API server; 10250 is the kubelet on each node."
   },
   {
    "q": "You can ping a host but curl hangs on port 443. Which is the most useful next command?",
    "o": [
     "ping again",
     "nc -zv host 443",
     "df -h",
     "systemctl status nginx"
    ],
    "a": 1,
    "why": "nc tests TCP reachability per port \u2014 it separates 'network fine' from 'port blocked'."
   }
  ]
 },
 {
  "id": "rest",
  "num": "03",
  "title": "REST APIs",
  "hook": "Flagged as strict hands-on. They will ask you to explain REST and then ask a follow-up that only someone who has built one can answer.",
  "sentence": "REST is: name things (resources), act on them with HTTP verbs, keep no memory of the caller, and answer with the right status code.",
  "analogy": "A filing cabinet with labelled drawers. GET reads a drawer, POST adds a page, PUT replaces a page, PATCH edits part of it, DELETE removes it.",
  "sections": [
   [
    "Resources and verbs",
    "/orders is a collection, /orders/4471 is one order. GET reads, POST creates, PUT replaces wholly, PATCH changes part, DELETE removes."
   ],
   [
    "Statelessness",
    "Each request carries everything needed (usually a token). The server keeps no session \u2014 which is why it scales horizontally."
   ],
   [
    "Status codes they expect you to know",
    "200 ok, 201 created, 204 no content, 301 moved, 400 bad input, 401 not authenticated, 403 authenticated but not allowed, 404 not found, 409 conflict, 422 validation, 429 rate limited, 500 server error, 502 bad upstream, 503 unavailable, 504 upstream timeout."
   ],
   [
    "Idempotency",
    "GET, PUT and DELETE asked twice should leave the same result; POST twice usually creates two rows \u2014 so retries on POST need an idempotency key."
   ],
   [
    "What a good integration has",
    "Timeout, retry with backoff on 5xx and 429 only, pagination, versioning (/v1), auth header, and a schema you validate."
   ]
  ],
  "code": "curl -i -X POST https://api/v1/orders \\\n  -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' \\\n  -d '{\"item\":\"plate\",\"qty\":2}'\n# -i shows the status line and headers, which is the part that matters",
  "say": "\"REST to me is resources, verbs and status codes, plus the unglamorous parts: timeouts, retries only on 5xx and 429, idempotency keys on POST, and versioning.\"",
  "quiz": [
   {
    "q": "A client retries a POST because of a timeout, and two orders appear. What was missing?",
    "o": [
     "Pagination",
     "An idempotency key",
     "TLS",
     "A 301 redirect"
    ],
    "a": 1,
    "why": "POST is not idempotent; a client-supplied key lets the server detect the duplicate."
   },
   {
    "q": "The upstream service is too slow and the proxy gives up. Which code does the caller see?",
    "o": [
     "500",
     "502",
     "504",
     "429"
    ],
    "a": 2,
    "why": "504 Gateway Timeout \u2014 the proxy waited and the upstream never answered."
   }
  ]
 },
 {
  "id": "ws",
  "num": "04",
  "title": "WebSockets, in one page",
  "hook": "Asked once, but it is a good place to show product sense: why live video or alerts are not polling.",
  "sentence": "A WebSocket starts as HTTP, then upgrades to a two-way connection that stays open, so the server can push without being asked.",
  "analogy": "Phone call instead of letters. Once connected both sides can talk at any moment; with HTTP the client must keep asking 'anything new?'",
  "sections": [
   [
    "The handshake",
    "Client sends GET with Upgrade: websocket; server answers 101 Switching Protocols; from then on it is frames, not requests."
   ],
   [
    "Why it matters at the edge",
    "Live view, detection events, camera status \u2014 pushing beats polling every second."
   ],
   [
    "What breaks it in production",
    "Proxies that strip Upgrade headers, idle timeouts, and load balancers without sticky sessions. Symptom: connects, then drops after 60 seconds."
   ]
  ],
  "code": "# nginx needs these or the upgrade dies\nproxy_set_header Upgrade $http_upgrade;\nproxy_set_header Connection \"upgrade\";\nproxy_read_timeout 3600s;",
  "say": "\"For live video and events I would use WebSockets, but they fail quietly behind proxies \u2014 so the first thing I check is Upgrade headers and idle timeout.\"",
  "quiz": [
   {
    "q": "Which status code completes a WebSocket handshake?",
    "o": [
     "200",
     "101",
     "204",
     "426"
    ],
    "a": 1,
    "why": "101 Switching Protocols is the upgrade confirmation."
   }
  ]
 },
 {
  "id": "k8s",
  "num": "05",
  "title": "Containers and Kubernetes, without the fog",
  "hook": "Six questions on that sheet are Kubernetes. You do not need to be an administrator \u2014 you need the mental model plus two debugging stories.",
  "sentence": "A container is a packaged process; Kubernetes is a scheduler that keeps the number of running copies you asked for, and routes traffic to them.",
  "analogy": "A restaurant. Image = recipe. Container = a dish being cooked. Pod = the plate with one or more dishes on it. Deployment = 'keep 3 plates ready'. Service = the waiter who always finds a plate. Ingress = the front door with a sign listing which table to go to.",
  "sections": [
   [
    "Image, container, pod",
    "An image is a frozen filesystem plus a command. A container runs it. A pod is the smallest schedulable unit \u2014 usually one container, sometimes a sidecar."
   ],
   [
    "Deployment and ReplicaSet",
    "You declare '3 replicas of this image'. The Deployment manages a ReplicaSet which keeps 3 pods alive, replacing dead ones."
   ],
   [
    "Service types",
    "ClusterIP \u2014 internal address. NodePort \u2014 a port on every node (30000\u201332767). LoadBalancer \u2014 asks the cloud for a real LB. ExternalName \u2014 a DNS alias. Headless \u2014 no virtual IP, for stateful sets."
   ],
   [
    "Config and secrets",
    "ConfigMap for settings, Secret for credentials \u2014 both mounted or injected as env vars. A missing one is a classic crash cause."
   ],
   [
    "Requests and limits",
    "Requests decide scheduling (is there room?), limits decide killing (did it exceed?). A pod with a request larger than any node is unschedulable \u2014 that is Pending."
   ]
  ],
  "code": "kubectl get pods -o wide          # status, node, IP\nkubectl describe pod web-abc       # events at the bottom: the real reason\nkubectl logs web-abc --previous    # logs from before the last crash\nkubectl get events --sort-by=.lastTimestamp | tail -20",
  "say": "\"I think in three objects: what should run (Deployment), what is running (Pod), and how traffic finds it (Service, then Ingress). Most incidents are one of those three lying.\"",
  "quiz": [
   {
    "q": "What is the difference between a request and a limit?",
    "o": [
     "None",
     "Request is for scheduling; limit is enforced at runtime",
     "Request is CPU only",
     "Limit is for disk"
    ],
    "a": 1,
    "why": "The scheduler only looks at requests; exceeding a limit gets the container throttled or OOM-killed."
   },
   {
    "q": "Which object gives pods a stable internal address?",
    "o": [
     "Ingress",
     "Service",
     "Deployment",
     "ConfigMap"
    ],
    "a": 1,
    "why": "Pods come and go; the Service's ClusterIP stays."
   }
  ]
 },
 {
  "id": "k8sdebug",
  "num": "06",
  "title": "Debugging: Pending vs CrashLoop",
  "hook": "Asked by two interviewers in different words. This is the question where a beginner and a practitioner are separated in ten seconds.",
  "sentence": "Pending means it never started (the scheduler refused); CrashLoop means it started and died (the container refused). Different commands, different causes.",
  "analogy": "Pending is a car with no parking space. CrashLoop is a car that starts, stalls, and is restarted every few seconds.",
  "sections": [
   [
    "Pending: ask the scheduler",
    "kubectl describe pod \u2192 Events. Causes: insufficient CPU/memory requests, node selector/affinity mismatch, taints without tolerations, unbound PVC (storage class WaitForFirstConsumer), exceeded ResourceQuota, max pods per node."
   ],
   [
    "CrashLoopBackOff: ask the container",
    "kubectl describe for the exit code, kubectl logs --previous for the reason. 137 = OOMKilled or SIGKILL. 143 = SIGTERM. 1 = the app's own fatal error. Also liveness probe too aggressive, missing ConfigMap/Secret, permission denied on a mounted volume."
   ],
   [
    "The one-line habit",
    "'Describe first, logs second, exec last.' Describe gives events and exit codes; logs need --previous once it is looping."
   ]
  ],
  "code": "# Pending\nkubectl describe pod api-0 | sed -n '/Events/,$p'\n#   Warning  FailedScheduling  0/3 nodes are available: 3 Insufficient memory.\n\n# CrashLoop\nkubectl describe pod api-0 | grep -E 'Last State|Exit Code|Reason'\nkubectl logs api-0 --previous",
  "say": "\"Pending is a scheduling problem, so I read the events; CrashLoop is a runtime problem, so I read the exit code and previous logs. 137 means I look at memory before I look at code.\"",
  "quiz": [
   {
    "q": "Pod shows Pending and the event says 'Insufficient cpu'. What do you change?",
    "o": [
     "The image tag",
     "The CPU request, or add a bigger node",
     "The Service type",
     "The liveness probe"
    ],
    "a": 1,
    "why": "The scheduler needs a node with enough allocatable CPU for the request."
   },
   {
    "q": "A container restarts with exit code 137. Most likely cause?",
    "o": [
     "Syntax error in code",
     "OOMKilled \u2014 it hit its memory limit",
     "Missing secret",
     "Port conflict"
    ],
    "a": 1,
    "why": "137 = 128+9 = SIGKILL, which is how the kernel ends an OOM-killed process."
   },
   {
    "q": "The pod is Running but never becomes Ready. What is the usual suspect?",
    "o": [
     "Image pull",
     "Readiness probe failing",
     "Node unschedulable",
     "PVC unbound"
    ],
    "a": 1,
    "why": "Readiness gates traffic, not process start."
   }
  ]
 },
 {
  "id": "edge",
  "num": "07",
  "title": "Ingress, reverse proxy, and L4 vs L7",
  "hook": "Three separate questions on that sheet collapse into one picture: how does a request from the internet reach a pod?",
  "sentence": "L4 forwards packets and does not read them; L7 reads the HTTP request and can make routing decisions. A reverse proxy is an L7 box; an ingress is a rule-set on one.",
  "analogy": "L4 is a mail sorter that only looks at the postcode. L7 opens the envelope, reads the department name, and delivers it there.",
  "sections": [
   [
    "L4 load balancer",
    "TCP/UDP only. Fast, protocol-agnostic, cannot route by URL. AWS NLB. Sticky sessions are per-connection."
   ],
   [
    "L7 load balancer / proxy",
    "Terminates TLS, reads Host and Path, sets X-Forwarded-For, can retry, cache, compress. AWS ALB, nginx, Envoy."
   ],
   [
    "Ingress in Kubernetes",
    "Ingress is a set of rules: host + path \u2192 Service. It does nothing unless an ingress controller (nginx, Traefik, ALB controller) is installed and watching."
   ],
   [
    "The failure modes to name",
    "502 (upstream gave nothing), 503 (no healthy endpoints), 504 (upstream too slow), 404 from the proxy (no matching rule), TLS error (wrong cert or SNI)."
   ]
  ],
  "code": "kubectl get ingress\nkubectl describe ingress web      # rules, backends, and the address it got\nkubectl logs -n ingress-nginx deploy/ingress-nginx-controller | tail -50",
  "say": "\"Ingress is just rules; the controller is the thing that runs. When a URL 404s at the edge but the pod is fine, I check the rule matching before I check the app.\"",
  "quiz": [
   {
    "q": "You create an Ingress and nothing changes. Most likely reason?",
    "o": [
     "Wrong image",
     "No ingress controller installed",
     "Service is ClusterIP",
     "DNS is broken"
    ],
    "a": 1,
    "why": "Ingress objects are inert without a controller watching them."
   },
   {
    "q": "Which component can route /api to one service and / to another?",
    "o": [
     "L4 balancer",
     "L7 proxy/ingress",
     "DNS",
     "The kubelet"
    ],
    "a": 1,
    "why": "Path routing requires reading HTTP, which is layer 7."
   }
  ]
 },
 {
  "id": "sso",
  "num": "08",
  "title": "SSO, SAML, OAuth and RBAC",
  "hook": "Asked three times, including 'hands-on SAML'. The trick is separating authentication (who you are) from authorisation (what you may do).",
  "sentence": "SSO delegates login to an identity provider. SAML and OIDC are two ways to carry the result. OAuth is about delegated access; RBAC is about roles inside your app.",
  "analogy": "A hotel. SSO is the front desk checking your ID once. The key card (token) opens your room. Your booking level (standard or suite) is the role, and that decides which doors the card opens.",
  "sections": [
   [
    "The three roles",
    "User, IdP (Okta, Entra ID, Keycloak), SP (your app). The IdP asserts identity; your app trusts the assertion."
   ],
   [
    "SAML in 5 steps",
    "User hits app \u2192 app redirects to IdP with a SAMLRequest \u2192 user authenticates \u2192 IdP posts a signed assertion to the ACS URL \u2192 app validates the signature and starts a session."
   ],
   [
    "OIDC instead",
    "Redirect to IdP, come back with a code, exchange it for an id_token (JWT), validate with the IdP's public keys (JWKS). Simpler for APIs and SPAs."
   ],
   [
    "OAuth is not login",
    "OAuth grants an app access to a resource on your behalf (scopes). OIDC is the layer that says who you are."
   ],
   [
    "RBAC",
    "Roles carry permissions, users get roles. In Kubernetes: Role + RoleBinding (namespaced), ClusterRole + ClusterRoleBinding (cluster-wide). Most 403s are a missing binding, not a missing role."
   ]
  ],
  "code": "# what the IdP metadata gives you\nentityID: https://idp.example.com/metadata\nACS URL: https://app.example.com/saml/acs     # where the assertion lands\ncert:    the IdP signing certificate (rotate it before it expires)\n\nkubectl auth can-i list pods --as=system:serviceaccount:app:api",
  "say": "\"SSO is authentication delegated to an IdP; SAML and OIDC are the transport for that assertion. Authorisation is separate \u2014 roles and bindings \u2014 and most 403s are a missing binding.\"",
  "quiz": [
   {
    "q": "In SAML, where does the IdP send the assertion?",
    "o": [
     "The login page",
     "The ACS URL of the service provider",
     "The DNS server",
     "The database"
    ],
    "a": 1,
    "why": "Assertion Consumer Service \u2014 the endpoint your app exposes to receive it."
   },
   {
    "q": "You get 403 from the Kubernetes API as a service account. Most likely?",
    "o": [
     "Wrong password",
     "Missing RoleBinding",
     "Expired token",
     "Network policy"
    ],
    "a": 1,
    "why": "Authentication worked (403, not 401); authorisation is missing."
   }
  ]
 },
 {
  "id": "linux",
  "num": "09",
  "title": "Linux server admin and the troubleshooting toolkit",
  "hook": "'How strong are you in Linux administration \u2014 we use Ubuntu server.' This is answered with tools and stories, not adjectives.",
  "sentence": "Ten commands cover most incidents: who is listening, what is consuming, what changed, and what the kernel said.",
  "analogy": "A car dashboard. You do not rebuild the engine to diagnose a warning light; you read the gauges in a fixed order.",
  "sections": [
   [
    "Services",
    "systemctl status/restart, journalctl -u unit -n 100 --no-pager, journalctl -p err -b. Most 'app is down' is a unit that failed to start."
   ],
   [
    "Listening and connections",
    "ss -lntp (listening), ss -tnp state established. Replaces netstat."
   ],
   [
    "Resources",
    "df -h (space), df -i (inodes!), free -m, top/htop, iostat -x 1, dmesg -T | tail (kernel: OOM kills, USB resets, I/O errors)."
   ],
   [
    "Network",
    "ip a, ip route, dig, curl -v, nc -zv host port, openssl s_client -connect host:443, tcpdump -i any port 443 -c 20."
   ],
   [
    "Firewall on Ubuntu",
    "ufw status verbose, ufw allow 443/tcp, or nft list ruleset for the real rules. Default deny inbound; allow only what the service needs."
   ],
   [
    "My order of attack",
    "Is it running \u2192 is it listening \u2192 is it reachable \u2192 is it healthy \u2192 what do the logs say \u2192 what changed (git, config, deploy)."
   ]
  ],
  "code": "systemctl status app --no-pager\nss -lntp | grep 8080\ndf -h; df -i\ncurl -v --max-time 5 http://127.0.0.1:8080/health\njournalctl -u app -n 100 --no-pager\n# and always: what changed since it worked?",
  "say": "\"I work in a fixed order \u2014 service, port, reachability, health, logs, change history \u2014 because it stops me guessing. And I check df -i as well as df -h, because 'no space' with an empty disk is usually inodes.\"",
  "quiz": [
   {
    "q": "df -h shows 20% used but writes fail with 'no space left on device'. Next command?",
    "o": [
     "df -i",
     "free -m",
     "ss -lntp",
     "dig"
    ],
    "a": 0,
    "why": "Inode exhaustion. Also possible: reserved blocks, or a deleted file still held open by a process (check lsof)."
   },
   {
    "q": "Which command shows what a unit wrote before it died?",
    "o": [
     "ss -lntp",
     "journalctl -u unit -n 100",
     "df -h",
     "ip route"
    ],
    "a": 1,
    "why": "journalctl is the systemd log; -u filters by unit."
   }
  ]
 },
 {
  "id": "deploy",
  "num": "10",
  "title": "Deploying on-prem, HA and disaster recovery",
  "hook": "Two questions: deploy on-prem, and how you configure HA and restore if disaster happens. Answer with a sequence and with numbers.",
  "sentence": "Deploy is a repeatable script; HA is removing every single point of failure; DR is proving you can restore, measured in RTO and RPO.",
  "analogy": "A restaurant kitchen. Deploy is the recipe written down. HA is two cooks who can cover each other. DR is the fire drill you have actually run.",
  "sections": [
   [
    "On-prem deploy, in order",
    "Hardened Ubuntu \u2192 runtime (packages or container) \u2192 config in files, secrets outside the repo \u2192 systemd or k8s unit \u2192 reverse proxy + TLS \u2192 database with backups \u2192 log rotation \u2192 monitoring and alerts \u2192 smoke test."
   ],
   [
    "HA",
    "At least two app instances behind a health-checked LB; stateless app so any instance can serve; replicated database with failover; no single disk; DNS or VIP failover."
   ],
   [
    "DR",
    "Backups you have restored at least once, off the box. State **RTO** (how long to be back) and **RPO** (how much data you can lose). For an NVR, RPO is 'how many minutes of video'."
   ],
   [
    "The lesson from your own incident",
    "Checks that watch causes miss failures; checks that watch results catch them. 'Is a decodable file being written right now' beats 'is the disk mounted'."
   ]
  ],
  "code": "# a deploy is a script, or it is a memory\n./deploy.sh --env prod --tag 1.4.2   # build, migrate, restart, health check, rollback on failure\nsystemctl restart app && curl -fsS localhost/health || ./rollback.sh",
  "say": "\"Deploy is a script with a health check and a rollback. HA means two of everything behind a health-checked VIP. DR means I can tell you the RTO and RPO, and I have done a restore, not just a backup.\"",
  "quiz": [
   {
    "q": "What does RPO measure?",
    "o": [
     "Time to restore",
     "How much data you can afford to lose",
     "Number of replicas",
     "Backup frequency only"
    ],
    "a": 1,
    "why": "Recovery Point Objective \u2014 the maximum acceptable data loss, in time."
   },
   {
    "q": "Which single change makes an app easier to run in HA?",
    "o": [
     "Bigger server",
     "Keeping it stateless",
     "One database",
     "Longer timeouts"
    ],
    "a": 1,
    "why": "Stateless instances can be replaced or multiplied freely."
   }
  ]
 }
];
