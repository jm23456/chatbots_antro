# -*- coding: utf-8 -*-
"""Generates the six debate1_<ling>_<role>.json files from debate_content.py.

Never edit the JSON by hand: run `npm run build:debates`.

Graph shape (all six files): intro -> round 1 (five opening statements) ->
three topic rounds -> summary.

  watching        rounds 2-4 run WATCH_ORDER, no choices.
  steering        each round is preceded by a choice of exactly three topics
                  (a moderating role: the participant picks what comes next).
  participating   rounds 2-4 run PARTY_ORDER (= WATCH_ORDER). Before each topic
                  the participant takes a stance by picking their own argument
                  (pro / neutral / contra); it is shown as their message and
                  the topic's lead bot responds to it in place of the lead-in.

The option pool never shrinks: unpicked options are carried forward with a
reworded label and one new topic joins each round, so every choice moment
shows three. Every path through a file has the same number of utterances,
which also keeps the app's progress bar exact.
"""
import json, os, sys, itertools, collections

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from debate_content import (OPENINGS, TOPICS, POOL_R2, NEW_AT, WATCH_ORDER,
                            POOL_ORDER, LEAD_SPEAKER, LEAD, LABELS, ACKS,
                            PARTY_ORDER, STANCE_ORDER, STANCES)

DIR = "src/debate_text"
BASE = json.load(open(f"{DIR}/debate1_firstperson_watch.json", encoding="utf-8"))
LEVEL = {"watch": "watching", "steer": "steering", "party": "participating"}
STYLE = {"firstperson": "first_person", "passive": "passive"}
VOICE = {"firstperson": "fp", "passive": "pv"}

INTRO = ("Die Krankenkassenprämien steigen nächstes Jahr im Schnitt um 4,5 Prozent. Seit Einführung der "
         "obligatorischen Krankenversicherung sind sie deutlich stärker gestiegen als Löhne oder Teuerung. "
         "Die Frage lautet: Wie krank ist unser Gesundheitssystem und wo muss angesetzt werden?")


def variant(topic, rnd):
    """Which label wording a topic carries when it is offered in round `rnd`."""
    if topic in POOL_R2:
        return rnd - 1              # offered in rounds 2, 3, 4 -> v1, v2, v3
    return rnd - next(r for r, t in NEW_AT.items() if t == topic) + 1


def utt(nodekey, i, spec, v):
    return {"uid": f"{nodekey}_{i:03d}", "arg_id": spec["arg_id"],
            "speaker": spec["speaker"], "text": spec[v]}


def lead_spec(topic, var, role):
    """The line that opens a topic: a plain lead-in, or the bot taking up the choice."""
    if role == "watch":
        return dict(arg_id=f"lead_{topic}", speaker=LEAD_SPEAKER[topic], **LEAD[topic])
    return dict(arg_id=f"ack_{topic}_v{var}", speaker=LEAD_SPEAKER[topic], **ACKS[(topic, var)])


def topic_node(nodekey, topic, var, rnd, role, v, transition):
    specs = [lead_spec(topic, var, role)] + TOPICS[topic]["utts"]
    return {"round": rnd, "kind": "segment", "topic": TOPICS[topic]["topic"], "topic_id": topic,
            "utterances": [utt(nodekey, i + 1, s, v) for i, s in enumerate(specs)],
            "transition": transition}


def choice(rnd, offered, keyfor):
    """Steering: `offered` is [(topic, label variant)], always three of them."""
    opts = [{"option_id": f"r{rnd}_o{n}", "topic_id": topic,
             "label": LABELS[(topic, var)]["steer"], "next": keyfor(topic, var)}
            for n, (topic, var) in enumerate(offered, start=1)]
    return {"type": "choice", "prompt": "Worüber soll als Nächstes diskutiert werden?",
            "timeout_seconds": None, "options": opts}


def stance_key(rnd, topic, stance):
    return f"r{rnd}_{topic}_{stance}"


def stance_choice(rnd, topic):
    """Participating: three arguments on `topic`, spoken as the participant."""
    st = STANCES[topic]
    return {"type": "choice",
            "prompt": f"{st['question']} Wählen Sie Ihr Argument:",
            "timeout_seconds": None,
            "options": [{"option_id": f"r{rnd}_{stance}", "topic_id": topic, "stance": stance,
                         "label": st["options"][stance]["label"],
                         "next": stance_key(rnd, topic, stance), "speak_as_user": True}
                        for stance in STANCE_ORDER]}


def stance_node(rnd, topic, stance, v, transition):
    """The lead bot's response to the chosen argument, then the topic as usual."""
    resp = STANCES[topic]["options"][stance]
    specs = [dict(arg_id=f"resp_{topic}_{stance}", speaker=LEAD_SPEAKER[topic],
                  fp=resp["fp"], pv=resp["pv"])] + TOPICS[topic]["utts"]
    k = stance_key(rnd, topic, stance)
    return k, {"round": rnd, "kind": "segment", "topic": TOPICS[topic]["topic"], "topic_id": topic,
               "stance": stance, "utterances": [utt(k, i + 1, s, v) for i, s in enumerate(specs)],
               "transition": transition}


def offered_in(rnd, picked):
    """Three options: everything unpicked that has joined the pool by now."""
    avail = [t for t in POOL_ORDER
             if t not in picked
             and (t in POOL_R2 or any(r <= rnd for r, x in NEW_AT.items() if x == t))]
    return [(t, variant(t, rnd)) for t in avail]


def build(ling, role):
    v = VOICE[ling]
    d = json.loads(json.dumps(BASE))            # reuse title/roles/display verbatim
    d["source"] = "Arena SRF 07.10.2016 – Prämienschock (gekürzt: Einführung + 4 Runden)"
    d["condition"] = {"linguistic_style": STYLE[ling], "interaction_level": LEVEL[role]}
    d["rounds"] = [{"round": 1, "topic": "Positionen und Ursachen"},
                   {"round": 2, "topic": "Themenrunde 1"},
                   {"round": 3, "topic": "Themenrunde 2"},
                   {"round": 4, "topic": "Themenrunde 3"}]
    nodes = {"intro": {"round": 0, "kind": "intro",
                       "utterances": [{"uid": "intro_001", "arg_id": "intro",
                                       "speaker": "SYSTEM", "text": INTRO}],
                       "transition": {"type": "linear", "next": "r1_trunk"}}}
    trunk = {"round": 1, "kind": "intro-arguments", "topic": "Ursachen der steigenden Prämien",
             "topic_id": "r1", "utterances": [utt("r1_trunk", i + 1, s, v)
                                              for i, s in enumerate(OPENINGS)]}

    if role == "watch":
        keys = [f"w{i + 2}_{t}" for i, t in enumerate(WATCH_ORDER)]
        trunk["transition"] = {"type": "linear", "next": keys[0]}
        for i, (k, t) in enumerate(zip(keys, WATCH_ORDER)):
            nxt = keys[i + 1] if i + 1 < len(keys) else "summary"
            nodes[k] = topic_node(k, t, 1, i + 2, role, v, {"type": "linear", "next": nxt})
    elif role == "party":
        for i, t in enumerate(PARTY_ORDER):
            rnd = i + 2
            nxt = ({"type": "linear", "next": "summary"} if i + 1 == len(PARTY_ORDER)
                   else stance_choice(rnd + 1, PARTY_ORDER[i + 1]))
            for stance in STANCE_ORDER:
                k, n = stance_node(rnd, t, stance, v, nxt)
                nodes[k] = n
        trunk["transition"] = stance_choice(2, PARTY_ORDER[0])
    else:
        # Round 4 nodes are terminal, so one per (topic, variant) is enough.
        r4 = lambda t, var: f"r4_{t}_v{var}"
        for t in POOL_ORDER:
            var = variant(t, 4)
            if (t, var) in ACKS:
                nodes[r4(t, var)] = topic_node(r4(t, var), t, var, 4, role, v,
                                               {"type": "linear", "next": "summary"})
        # Round 3 nodes need the first pick too, because it decides what is
        # still on the table in round 4.
        for p1 in POOL_R2:
            for p2, _ in offered_in(3, {p1}):
                k = f"r3_{p1}_{p2}"
                nodes[k] = topic_node(k, p2, variant(p2, 3), 3, role, v,
                                      choice(3, offered_in(4, {p1, p2}), r4))
        for p1 in POOL_R2:
            k = f"r2_{p1}"
            nodes[k] = topic_node(k, p1, variant(p1, 2), 2, role, v,
                                  choice(2, offered_in(3, {p1}),
                                         lambda t, var, a=p1: f"r3_{a}_{t}"))
        trunk["transition"] = choice(1, offered_in(2, set()),
                                     lambda t, var: f"r2_{t}")

    nodes["r1_trunk"] = trunk
    nodes["summary"] = {"round": 5, "kind": "summary", "utterances": [{
        "uid": "sum_001", "arg_id": "summary", "speaker": "SYSTEM",
        "text": "Die Debatte zeigt, dass die steigenden Krankenkassenprämien mehrere Ursachen haben:",
        "points": ["Mengenausweitung bei medizinischen Behandlungen",
                   "Fehlanreize und fehlende Qualitätsanreize im Gesundheitssystem",
                   "Ungleiche Verteilung der Gesundheitskosten"],
        "conclusion": "Einfache Lösungen gibt es nicht. Reformen müssen Kosten, Qualität und Verantwortung gemeinsam berücksichtigen."}],
        "transition": {"type": "end"}}
    d["nodes"] = {k: nodes[k] for k in
                  ["intro", "r1_trunk"] + sorted(k for k in nodes if k not in ("intro", "r1_trunk", "summary")) + ["summary"]}
    d["start_node"] = "intro"
    return d


for ling in ("firstperson", "passive"):
    for role in ("watch", "steer", "party"):
        d = build(ling, role)
        p = f"{DIR}/debate1_{ling}_{role}.json"
        with open(p, "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False, indent=2)
            f.write("\n")

        def walk(k, acc=0, opts=()):
            n = d["nodes"][k]
            if n["kind"] == "summary":
                return [(acc, opts)]
            u = len(n.get("utterances", []))
            tr = n["transition"]
            if tr["type"] == "linear":
                return walk(tr["next"], acc + u, opts)
            return [x for o in tr["options"]
                    for x in walk(o["next"], acc + u, opts + (len(tr["options"]),))]
        paths = walk("intro")
        spk = collections.Counter(x["speaker"] for n in d["nodes"].values()
                                  for x in n.get("utterances", []) if x["speaker"] != "SYSTEM")
        print(f"{os.path.basename(p):36s} nodes={len(d['nodes']):3d} paths={len(paths):3d} "
              f"utt/path={sorted({a for a, _ in paths})} options={sorted({o for _, o in paths})} "
              f"per-bot={dict(sorted(spk.items()))}")
