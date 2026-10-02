# -*- coding: utf-8 -*-
# Content source: Arena SRF 07.10.2016 "Prämienschock" (src/debate_text/original/arena_2016-10-07_Kr.txt)
# Speaker mapping: A=Brand(SVP/santésuisse) B=Steiert(SP)+Häsler(Grüne) C=Carrel(Herzchirurg)
#                  D=Slembeck(Gesundheitsökonom) E=Publikum(Huber/Willi/Zweifel/Bürkli)
# Rule: fp and pv carry IDENTICAL propositional content. Only the voice differs.
#   fp = own lived experience, first person ("ich sehe / bei mir / ich erlebe")
#   pv = impersonal, no first-person experience ("es zeigt sich / Studien zeigen / berichtet wird")

OPENINGS = [
 dict(arg_id="op_A", speaker="A",
  fp="Ich sehe die Entwicklung noch dramatischer, als sie hier dargestellt wird. Für mich ist die Rechnung einfach: Die Prämien sind die Folge der Kosten, und die Kosten sind die Folge der Behandlungen. Je mehr behandelt wird, desto höher steigen die Prämien. Ich bin überzeugt, dass wir dort ansetzen müssen und nicht bei der Frage, wie wir die Rechnung verteilen.",
  pv="Die Entwicklung ist dramatischer, als sie meist dargestellt wird. Die Rechnung ist einfach: Die Prämien sind die Folge der Kosten, und die Kosten sind die Folge der Behandlungen. Je mehr behandelt wird, desto höher steigen die Prämien. Anzusetzen ist deshalb dort und nicht bei der Frage, wie die Rechnung verteilt wird."),
 dict(arg_id="op_B", speaker="B",
  fp="Ich jammere nicht über die Kosten. Wir haben eines der besten Gesundheitssysteme der Welt, und ich profitiere davon wie alle anderen. Was mich beschäftigt, ist die Verteilung. Im Schnitt sind es 4,5 Prozent mehr, aber ich kenne Familien, die nächstes Jahr 15 Prozent mehr bezahlen, und andere, die null Prozent mehr bezahlen. Darin sehe ich die eigentliche Ungerechtigkeit.",
  pv="Über die Kosten allein ist nicht zu klagen. Das schweizerische Gesundheitssystem gehört zu den besten der Welt, und alle profitieren davon. Entscheidend ist die Verteilung. Im Schnitt sind es 4,5 Prozent mehr, doch manche Familien bezahlen nächstes Jahr 15 Prozent mehr und andere null Prozent. Darin liegt die eigentliche Ungerechtigkeit."),
 dict(arg_id="op_C", speaker="C",
  fp="In meinem Spital merke ich den Druck, der auf den Patienten lastet. Ich sehe Leute, die ihre Prämien nicht mehr bezahlen können. Gleichzeitig erlebe ich den Gesundheitsmarkt wie einen Supermarkt: An der Kasse bezahlt am Schluss niemand selbst. Ich glaube, es braucht auf beiden Seiten mehr Vernunft, bei den Patienten und bei uns Medizinern.",
  pv="In den Spitälern ist der Druck, der auf den Patienten lastet, deutlich spürbar. Es gibt Menschen, die ihre Prämien nicht mehr bezahlen können. Gleichzeitig funktioniert der Gesundheitsmarkt wie ein Supermarkt: An der Kasse bezahlt am Schluss niemand selbst. Nötig ist mehr Vernunft auf beiden Seiten, bei den Patienten und bei der Ärzteschaft."),
 dict(arg_id="op_D", speaker="D",
  fp="Persönlich rege ich mich über meine Prämienrechnung auch auf. Als Ökonom sehe ich es anders. Ich schaue auf den Anteil des Gesundheitswesens an der Gesamtwirtschaft, und der liegt seit zehn Jahren fast konstant bei 9 bis 11 Prozent, ähnlich wie in Deutschland oder Frankreich. Für ein reiches Land finde ich das eigentlich wenig.",
  pv="Über die eigene Prämienrechnung lässt sich verständlicherweise klagen. Ökonomisch betrachtet zeigt sich ein anderes Bild. Der Anteil des Gesundheitswesens an der Gesamtwirtschaft liegt seit zehn Jahren fast konstant bei 9 bis 11 Prozent, ähnlich wie in Deutschland oder Frankreich. Für ein reiches Land ist das eigentlich wenig."),
 dict(arg_id="op_E", speaker="E",
  fp="Ich habe ein erstklassiges Gesundheitssystem, und die Kosten zwingen mich langsam in ein drittklassiges. Ich bezahle jeden Monat mehr, mein Lohn steigt aber nicht im gleichen Tempo. Ich mache mir vor allem Sorgen, wie das in zehn Jahren aussehen soll.",
  pv="Das Gesundheitssystem ist erstklassig, die Kosten zwingen viele Haushalte aber in Richtung eines drittklassigen. Die Prämien steigen Monat für Monat, die Löhne nicht im gleichen Tempo. Sorgen macht vor allem die Frage, wie das in zehn Jahren aussehen soll."),
]

TOPICS = {
 "t1": dict(
  topic="Wer zahlt wie viel? Prämienlast und Verteilung",
  utts=[
   dict(arg_id="t1_E", speaker="E",
    fp="Ich bin 72 und alleinstehend. Ich habe zwei Kollegen gefragt, beide über 70, beide alleinstehend, beide mit genau der gleichen Zusatzversicherung wie ich. Der eine bezahlt 40 Franken weniger als ich, der andere 100 Franken weniger. Das kann ich niemandem erklären.",
    pv="Aus der Bevölkerung wird von folgendem Vergleich berichtet: Drei alleinstehende Personen über 70 mit genau derselben Zusatzversicherung. Die eine bezahlt 40 Franken weniger, die andere 100 Franken weniger. Erklärbar ist ein solcher Unterschied kaum."),
   dict(arg_id="t1_A", speaker="A",
    fp="Ich kann Ihnen den Unterschied im Einzelfall auch nicht erklären. Ich weiss aber, wie wir rechnen: Prämien werden aufgrund einer Risikoanalyse kalkuliert, nach Alter, Geschlecht und Anfälligkeit für Krankheiten. Das ist keine Willkür, sondern eine Kalkulation. Und ich sage klar: Prämienverbilligungen ändern daran nichts, sie verschieben die Rechnung nur.",
    pv="Im Einzelfall ist der Unterschied schwer zu erklären. Die Berechnung ist aber bekannt: Prämien werden aufgrund einer Risikoanalyse kalkuliert, nach Alter, Geschlecht und Anfälligkeit für Krankheiten. Das ist keine Willkür, sondern eine Kalkulation. Klar ist auch: Prämienverbilligungen ändern daran nichts, sie verschieben die Rechnung nur."),
   dict(arg_id="t1_B", speaker="B",
    fp="Für mich sind das zwei getrennte Probleme. Ich sehe, dass die untersten Einkommen über die Prämienverbilligung recht gut entlastet sind und die höchsten Einkommen bei uns die billigsten Prämien Europas bezahlen. Daraus folgere ich: Die Last landet in der Mitte. Ich bin selbst Vater von zwei Kindern und merke jeden Herbst, wenn die neue Prämienrechnung kommt, wie viel davon an uns hängen bleibt. Ich arbeite deshalb an einer gezielten Entlastung für Familien mit Kindern und für die 18- bis 25-Jährigen.",
    pv="Es handelt sich um zwei getrennte Probleme. Die untersten Einkommen sind über die Prämienverbilligung recht gut entlastet, und die höchsten Einkommen bezahlen in der Schweiz die billigsten Prämien Europas. Die Last landet damit in der Mitte. Familien mit Kindern merken jeden Herbst, wenn die neue Prämienrechnung kommt, wie viel davon an ihnen hängen bleibt. Im Parlament liegt deshalb eine gezielte Entlastung für Familien mit Kindern und für die 18- bis 25-Jährigen."),
   dict(arg_id="t1_D", speaker="D",
    fp="Ich höre immer, die Alterung sei die Ursache. Ich halte das für einen Mythos. Wenn ich mir die Studien anschaue, macht die demografische Alterung etwa 20 bis 25 Prozent des Kostenanstiegs aus, nicht mehr. Und ich frage mich: Wenn das die Ursache wäre, was genau wollen wir dann bekämpfen? Dass Menschen älter werden?",
    pv="Häufig wird die Alterung als Ursache genannt. Das ist ein Mythos. Studien zeigen, dass die demografische Alterung etwa 20 bis 25 Prozent des Kostenanstiegs ausmacht, nicht mehr. Und wäre sie die Ursache, bliebe offen, was daran zu bekämpfen wäre: dass Menschen älter werden?"),
  ]),
 "t2": dict(
  topic="Wo entstehen die Kosten? Spitäler, Geräte und Qualität",
  utts=[
   dict(arg_id="t2_D", speaker="D",
    fp="Ich nenne das einen Ausstattungswettbewerb. Ich beobachte, dass jedes Spital einen Operationsroboter braucht, weil sonst die Leute nicht kommen. Ich habe selbst im Verwaltungsrat eines Regionalspitals gesessen und erlebt, wie dieser Druck entsteht. Geplant wird das alles auf Kantonsebene, und für mich ist genau das das Hauptproblem: Der Kanton ist Planer, Finanzierer und Aufsicht zugleich, und das beisst sich. Ich würde in sieben bis zehn Versorgungsregionen denken statt in 26 Kantonen.",
    pv="Zu beobachten ist ein Ausstattungswettbewerb: Jedes Spital braucht einen Operationsroboter, weil sonst die Patienten ausbleiben. In den Verwaltungsräten von Regionalspitälern zeigt sich, wie dieser Druck entsteht. Geplant wird auf Kantonsebene, und genau darin liegt das Hauptproblem: Der Kanton ist Planer, Finanzierer und Aufsicht zugleich, und das beisst sich. Sinnvoller wäre, in sieben bis zehn Versorgungsregionen zu denken statt in 26 Kantonen."),
   dict(arg_id="t2_C", speaker="C",
    fp="Wir Herzchirurgen haben vor 15 Jahren gesagt, dieser Operationsroboter sei Quatsch: zwei Millionen Franken Anschaffung, 200'000 Franken Unterhalt im Jahr, und die Resultate sind nicht besser. Ich bin stolz darauf, dass wir das nicht mitgemacht haben. Mehr ärgert mich etwas anderes: Ich liefere seit zehn Jahren Qualitätsindikatoren zu Sterblichkeit, Komplikationen und Infekten. Die Unterschiede zwischen den Spitälern sind teilweise eins zu sechs, und es hat keine Konsequenzen.",
    pv="In der Herzchirurgie wurde bereits vor 15 Jahren festgehalten, dass dieser Operationsroboter unnötig ist: zwei Millionen Franken Anschaffung, 200'000 Franken Unterhalt im Jahr, und die Resultate sind nicht besser. Schwerer wiegt etwas anderes: Qualitätsindikatoren zu Sterblichkeit, Komplikationen und Infekten werden seit zehn Jahren geliefert. Die Unterschiede zwischen den Spitälern betragen teilweise eins zu sechs, und es hat keine Konsequenzen."),
   dict(arg_id="t2_B", speaker="B",
    fp="Ich erkläre das immer mit Bäckereien. In einem Dorf mit drei Bäckereien werden 1000 Brote pro Tag verkauft. Kommt eine vierte dazu, sind es weiterhin 1000. Bei Röntgenzentren ist es anders: Kommt ein fünftes dazu, werden mehr Bilder gemacht, ob nötig oder nicht. Ich habe gesehen, wie eine Finanzgesellschaft in ein solches Zentrum investiert und ihr Kapital in drei Jahren amortisiert hat. Ich finde, das muss man bremsen, aber nicht der Versicherer allein.",
    pv="Ein Vergleich mit Bäckereien macht es deutlich. In einem Dorf mit drei Bäckereien werden 1000 Brote pro Tag verkauft. Kommt eine vierte dazu, sind es weiterhin 1000. Bei Röntgenzentren verhält es sich anders: Kommt ein fünftes dazu, werden mehr Bilder gemacht, ob nötig oder nicht. Eine Finanzgesellschaft hat in ein solches Zentrum investiert und ihr Kapital in drei Jahren amortisiert. Gebremst werden muss das, aber nicht durch die Versicherer allein."),
   dict(arg_id="t2_A", speaker="A",
    fp="Da sind wir uns näher, als ich dachte. Mein Problem ist ein anderes: Ich muss am Schluss alles bezahlen. Ich habe kein Vetorecht, ich kann nicht sagen, diese Behandlung war überflüssig. Diesen Vertragszwang halte ich für einen wesentlichen Kostentreiber. Und ich bezahle heute die sehr gute Leistung zum genau gleichen Preis wie den Pfusch.",
    pv="Die Positionen liegen näher zusammen als erwartet. Das Problem der Versicherer ist ein anderes: Am Schluss muss alles bezahlt werden. Es gibt kein Vetorecht, überflüssige Behandlungen können nicht abgelehnt werden. Dieser Vertragszwang ist ein wesentlicher Kostentreiber. Und die sehr gute Leistung wird zum genau gleichen Preis bezahlt wie der Pfusch."),
  ]),
 "t3": dict(
  topic="Wie viel Medizin ist genug? Überversorgung und Eigenverantwortung",
  utts=[
   dict(arg_id="t3_C", speaker="C",
    fp="Ich gebe Ihnen ein Beispiel aus meinem Alltag: Kopfschmerzen. Viele Patienten haben das Gefühl, es brauche sofort eine Magnetresonanz-Untersuchung. Ich würde sagen, 99 Prozent davon sind unnötig. Aber wenn ich sie einmal nicht mache und einen Tumor verpasse, stehe ich vor Gericht. Und ich erlebe es immer wieder: Wer bei mir eine Operation nicht bekommt, geht zum nächsten Arzt, bis ihn jemand operiert.",
    pv="Ein Beispiel aus dem klinischen Alltag: Kopfschmerzen. Viele Patienten erwarten sofort eine Magnetresonanz-Untersuchung. Rund 99 Prozent davon sind unnötig. Wird sie einmal nicht gemacht und ein Tumor verpasst, folgt das Gericht. Und immer wieder zeigt sich: Wer an einem Ort keine Operation bekommt, wandert zum nächsten Arzt, bis sich jemand findet, der operiert."),
   dict(arg_id="t3_E", speaker="E",
    fp="Ich bin 72 und habe viele Kollegen, die eine Patientenverfügung haben. Ich habe für mich entschieden: Ich will nicht an eine Maschine gehängt werden, die Tausende Franken pro Tag kostet, nur damit ich zehn Tage länger lebe. Wer das möchte, soll es bekommen, aber für mich gehört das nicht in die soziale Krankenversicherung.",
    pv="Viele ältere Menschen haben heute eine Patientenverfügung. Der Wunsch dahinter ist klar: nicht an eine Maschine gehängt zu werden, die Tausende Franken pro Tag kostet, nur um zehn Tage länger zu leben. Wer das möchte, soll es bekommen, in die soziale Krankenversicherung gehört es aber nicht."),
   dict(arg_id="t3_A", speaker="A",
    fp="Ich appelliere an die Eigenverantwortung der Patienten, und ich setze auf Information, Information, Information. Heute weiss jeder, welche Konsequenzen Rauchen hat. Aber ich sage auch klar: Ich will niemandem 20 Prozent abziehen, weil er raucht. Das postuliere ich nicht.",
    pv="Gefordert ist die Eigenverantwortung der Patienten, gestützt auf Information, Information, Information. Heute sind die Konsequenzen des Rauchens allgemein bekannt. Klar ist aber auch: Leistungsabzüge von 20 Prozent für Rauchende werden nicht postuliert."),
   dict(arg_id="t3_B", speaker="B",
    fp="Ich habe erlebt, wie ein Politiker behauptet hat, man könne 20 Prozent der Leistungen streichen. Als die Journalisten nachfragten, hatte er nach zehn Minuten 0,5 Promille zusammengekratzt. Für mich ist die Lehre daraus: Es geht nicht darum, eine Leistung für alle zu streichen, sondern individuell zu entscheiden. Und ich finde es falsch, Kranke zu bestrafen. Die gleiche Krankheit kann auch von schlechten Arbeitsbedingungen kommen.",
    pv="Ein Politiker behauptete einst, 20 Prozent der Leistungen könnten gestrichen werden. Auf Nachfragen der Journalisten kamen nach zehn Minuten 0,5 Promille zusammen. Die Lehre daraus: Es geht nicht darum, eine Leistung für alle zu streichen, sondern individuell zu entscheiden. Kranke zu bestrafen ist der falsche Ansatz. Dieselbe Krankheit kann auch von schlechten Arbeitsbedingungen herrühren."),
  ]),
}

# ---------------------------------------------------------------------------
# Two further topics, so the option pool never shrinks below three.
# ---------------------------------------------------------------------------
TOPICS["t4"] = dict(
  topic="Notfall statt Hausarzt: stimmt die Grundversorgung?",
  utts=[
   dict(arg_id="t4_E", speaker="E",
    fp="Mein Mann war lange schwer krank, und ich war mit ihm fast jedes Wochenende im Notfall. Dort sassen Familien mit Kindern, die gehustet haben. Ich habe am Empfang gefragt, warum die nicht zum Hausarzt gehen. Man hat mir gesagt, viele wüssten das nicht.",
    pv="Angehörige von Langzeitpatienten berichten von Wochenenden in der Notfallaufnahme, in der immer wieder Familien mit hustenden Kindern sassen. Fast jede Woche war das zu beobachten. Auf Nachfrage am Empfang hiess es, vielen Betroffenen sei der Weg zum Hausarzt gar nicht bekannt."),
   dict(arg_id="t4_A", speaker="A",
    fp="Ich kann das bestätigen: Rund 80 Prozent der Notfälle in den Spitalambulatorien sind Bagatellfälle. Sie gehören nicht ins Spital und verursachen enorme Kosten. Dazu kommt, dass ich zwischen den Kantonen einen enormen Wettbewerb mit Spitalbauten beobachte, gerade bei den Ambulatorien.",
    pv="Die Zahlen bestätigen das: Rund 80 Prozent der Notfälle in den Spitalambulatorien sind Bagatellfälle. Sie gehören nicht ins Spital und verursachen enorme Kosten. Dazu kommt ein enormer Wettbewerb zwischen den Kantonen mit Spitalbauten, gerade bei den Ambulatorien."),
   dict(arg_id="t4_B", speaker="B",
    fp="Für mich stimmt dann etwas in der Grundversorgung nicht. Wir haben zu wenig Hausärzte in diesem Land und finden keine Nachfolger. Ich sehe auch, warum: Heute will niemand mehr 90 Stunden pro Woche arbeiten und Tag und Nacht erreichbar sein. Ich setze deshalb auf neue Modelle, auf Gemeinschaftspraxen und Notfallpraxen am Spital.",
    pv="Damit stimmt etwas in der Grundversorgung nicht. Es gibt zu wenig Hausärzte in diesem Land, und Nachfolger fehlen. Der Grund liegt auf der Hand: Niemand will mehr 90 Stunden pro Woche arbeiten und Tag und Nacht erreichbar sein. Nötig sind deshalb neue Modelle, Gemeinschaftspraxen und Notfallpraxen am Spital."),
   dict(arg_id="t4_C", speaker="C",
    fp="Für mich ist der Hausarzt der Gatekeeper. Ich erwarte, dass er den Patienten führt, ihm einen Spezialisten empfiehlt und dass der Patient dieser Empfehlung dann auch folgt. Ich erlebe aber oft, dass Patienten hinter dem Rücken des Hausarztes noch drei andere aufsuchen.",
    pv="Der Hausarzt ist der Gatekeeper. Von ihm ist zu erwarten, dass er den Patienten führt, einen Spezialisten empfiehlt und dass der Patient dieser Empfehlung folgt. Häufig werden hinter dem Rücken des Hausarztes jedoch noch drei weitere Ärzte aufgesucht."),
  ])

TOPICS["t5"] = dict(
  topic="Tarife und Politik: warum bewegt sich nichts?",
  utts=[
   dict(arg_id="t5_E", speaker="E",
    fp="Für mich ist das alles Kleinkram. Ich habe das Gefühl, wir treten auf Wasserschläuchen herum: Überall spritzt etwas heraus, aber an die Struktur kommt niemand. Und wenn mir jemand sagt, wir könnten uns das leisten, weil es nur 10 Prozent kostet, dann soll er das bitte mir erklären. Ich bezahle 500 Franken im Monat.",
    pv="Das alles ist Kleinkram. Es gleicht dem Herumtreten auf Wasserschläuchen: Überall spritzt etwas heraus, an die Struktur kommt aber niemand. Und wenn es heisst, das sei tragbar, weil es nur 10 Prozent kostet, dann ist das jenen zu erklären, die 500 Franken im Monat bezahlen."),
   dict(arg_id="t5_A", speaker="A",
    fp="Ich habe ganz konkrete Vorschläge. Ich will die Einzelfallabrechnung durch Pauschalen ersetzen und das System vereinfachen, damit wir die Kosten besser steuern können. Nur habe ich im Parlament die Mehrheit nicht. Das ist mein Problem.",
    pv="Es liegen konkrete Vorschläge vor: Die Einzelfallabrechnung soll durch Pauschalen ersetzt und das System vereinfacht werden, damit die Kosten besser gesteuert werden können. Im Parlament fehlt dafür allerdings die Mehrheit. Das ist das Problem."),
   dict(arg_id="t5_D", speaker="D",
    fp="Ich finde das einfacher, als es hier dargestellt wird. Das Tarifsystem hat rund 4700 Positionen. Ich habe selbst an der letzten Revision mitgearbeitet. Ich muss aber nicht alle revidieren: Mit den 300 wichtigsten deckt man etwa 80 Prozent aller Leistungen ab. Das ist machbar.",
    pv="Das ist einfacher, als es meist dargestellt wird. Das Tarifsystem hat rund 4700 Positionen. Das zeigt die Erfahrung aus der letzten Revision. Revidiert werden müssen nicht alle: Mit den 300 wichtigsten sind etwa 80 Prozent aller Leistungen abgedeckt. Das ist machbar."),
   dict(arg_id="t5_B", speaker="B",
    fp="Ein Zauberrezept habe ich nicht, und ich habe auch noch keines gehört. Was ich sehe: Es gibt Ärzte, die dieselbe Leistung heute vier- oder fünfmal schneller erbringen und immer noch gleich bezahlt werden. Deshalb brauche ich neue Tarife. Und ich sage offen: Wenn in der Kommission die Kassenvertreter fast die Mehrheit haben und selbst bestimmen, wer sie beaufsichtigt, ist das für mich nicht tragbar.",
    pv="Ein Zauberrezept gibt es nicht, und bisher wurde keines vorgelegt. Festzustellen ist: Es gibt Ärzte, die dieselbe Leistung heute vier- oder fünfmal schneller erbringen und immer noch gleich bezahlt werden. Deshalb braucht es neue Tarife. Und wenn in der Kommission die Kassenvertreter fast die Mehrheit haben und selbst bestimmen, wer sie beaufsichtigt, ist das nicht tragbar."),
  ])

# ---------------------------------------------------------------------------
# Option pool. Rounds 2-4 each show exactly three options: the options nobody
# picked are carried forward with a reworded label, and one new topic joins.
#   round 2:  t1 t2 t3            (labels v1)
#   round 3:  the two unpicked (v2) + t4 (v1)
#   round 4:  the two still unpicked (v3 / t4 v2) + t5 (v1)
# ---------------------------------------------------------------------------
POOL_R2 = ["t1", "t2", "t3"]
NEW_AT = {3: "t4", 4: "t5"}
WATCH_ORDER = ["t1", "t2", "t3"]
POOL_ORDER = ["t1", "t2", "t3", "t4", "t5"]

# Who introduces each topic (lead line in watching, acknowledgement elsewhere).
LEAD_SPEAKER = {"t1": "B", "t2": "D", "t3": "C", "t4": "B", "t5": "A"}

# Watching has no choice, so the topic is opened by a plain lead-in.
LEAD = {
 "t1": dict(fp="Bevor wir über Ursachen streiten, schaue ich darauf, wer die Rechnung eigentlich bezahlt.",
            pv="Bevor über Ursachen gestritten wird, lohnt der Blick darauf, wer die Rechnung eigentlich bezahlt."),
 "t2": dict(fp="Ich schaue jetzt darauf, wo diese Kosten im System überhaupt entstehen.",
            pv="Als Nächstes ist zu klären, wo diese Kosten im System überhaupt entstehen."),
 "t3": dict(fp="Jetzt komme ich zu der Frage, die mich in meinem Alltag am meisten beschäftigt: Wie viel Medizin ist genug?",
            pv="Damit stellt sich die Frage, die im klinischen Alltag am meisten beschäftigt: Wie viel Medizin ist genug?"),
}

# One label per (topic, appearance). Reworded each time so a carried-forward
# option does not read as the same option again.
LABELS = {
 ("t1", 1): dict(steer="Über die Verteilung der Prämienlast sprechen",
                 party="Mich beschäftigt vor allem, wer wie viel bezahlt."),
 ("t1", 2): dict(steer="Doch zuerst fragen, wer die Prämien am stärksten spürt",
                 party="Ich würde jetzt gerne wissen, wer die Prämien am stärksten spürt."),
 ("t1", 3): dict(steer="Zum Schluss über die Belastung der Haushalte sprechen",
                 party="Zum Schluss interessiert mich, wie stark die Haushalte belastet werden."),
 ("t2", 1): dict(steer="Den Kostentreibern im System nachgehen",
                 party="Ich möchte wissen, wo die Kosten überhaupt entstehen."),
 ("t2", 2): dict(steer="Fragen, warum so viel in Spitäler und Geräte investiert wird",
                 party="Ich frage mich, warum so viel in Spitäler und Geräte investiert wird."),
 ("t2", 3): dict(steer="Zum Schluss über die Kosten in den Spitälern sprechen",
                 party="Zum Schluss möchte ich über die Kosten in den Spitälern sprechen."),
 ("t3", 1): dict(steer="Über unnötige Behandlungen sprechen",
                 party="Ich frage mich, ob nicht einfach zu viel Medizin gemacht wird."),
 ("t3", 2): dict(steer="Fragen, ob zu viele Untersuchungen gemacht werden",
                 party="Ich würde gerne wissen, ob zu viele Untersuchungen gemacht werden."),
 ("t3", 3): dict(steer="Zum Schluss über die Grenzen der Medizin sprechen",
                 party="Zum Schluss interessieren mich die Grenzen der Medizin."),
 ("t4", 1): dict(steer="Über Notfall und Hausarztversorgung sprechen",
                 party="Mich interessiert, warum so viele direkt in den Notfall gehen."),
 ("t4", 2): dict(steer="Fragen, ob die Grundversorgung noch stimmt",
                 party="Ich frage mich, ob die Grundversorgung überhaupt noch stimmt."),
 ("t5", 1): dict(steer="Über Tarife und die Blockade in der Politik sprechen",
                 party="Zum Schluss möchte ich wissen, warum die Politik das nicht löst."),
}

# The lead bot picks the chosen framing up, so the choice visibly lands.
ACKS = {
 ("t1", 1): dict(fp="Gut, dass du damit anfängst. Ich schaue nämlich weniger auf die Durchschnittsprämie als darauf, bei wem die Rechnung landet.",
                 pv="Ein guter Anfang. Entscheidend ist weniger die Durchschnittsprämie als die Frage, bei wem die Rechnung landet."),
 ("t1", 2): dict(fp="Wer die Prämien am stärksten spürt, ist für mich die entscheidende Frage. Ich sehe die Belastung sehr ungleich verteilt.",
                 pv="Wer die Prämien am stärksten spürt, ist die entscheidende Frage. Die Belastung ist sehr ungleich verteilt."),
 ("t1", 3): dict(fp="Dann komme ich gerne noch zur Belastung der Haushalte, denn genau dort sehe ich das eigentliche Problem.",
                 pv="Bleibt noch die Belastung der Haushalte, denn genau dort liegt das eigentliche Problem."),
 ("t2", 1): dict(fp="Gute Frage, denn ich glaube, dass wir die Kosten meistens am falschen Ort suchen.",
                 pv="Eine zentrale Frage, denn die Kosten werden meistens am falschen Ort gesucht."),
 ("t2", 2): dict(fp="Bei den Investitionen in Spitäler und Geräte sehe ich als Ökonom den grössten Hebel.",
                 pv="Bei den Investitionen in Spitäler und Geräte liegt ökonomisch der grösste Hebel."),
 ("t2", 3): dict(fp="Dann schaue ich zum Schluss noch auf die Spitäler, denn dort liegen rund 40 Prozent der Kosten.",
                 pv="Bleiben zum Schluss die Spitäler, denn dort liegen rund 40 Prozent der Kosten."),
 ("t3", 1): dict(fp="Das finde ich einen wichtigen Punkt. Ich stelle mir diese Frage in meinem Alltag ständig.",
                 pv="Das ist ein wichtiger Punkt. Im klinischen Alltag stellt sich diese Frage ständig."),
 ("t3", 2): dict(fp="Ob zu viele Untersuchungen gemacht werden, frage ich mich fast jeden Tag.",
                 pv="Ob zu viele Untersuchungen gemacht werden, ist eine fast tägliche Frage."),
 ("t3", 3): dict(fp="Über Grenzen rede ich gerne, auch wenn ich sie im Spital nicht immer ziehen kann.",
                 pv="Über Grenzen ist zu reden, auch wenn sie im Spital nicht immer gezogen werden können."),
 ("t4", 1): dict(fp="Dass so viele direkt in den Notfall gehen, verstehe ich sogar, gerade bei kleinen Kindern.",
                 pv="Dass so viele direkt in den Notfall gehen, ist nachvollziehbar, gerade bei kleinen Kindern."),
 ("t4", 2): dict(fp="Ob die Grundversorgung noch stimmt, ist für mich die Kernfrage. In den Bergregionen sehe ich, wie dünn das Netz ist.",
                 pv="Ob die Grundversorgung noch stimmt, ist die Kernfrage. In Bergregionen zeigt sich, wie dünn das Netz ist."),
 ("t5", 1): dict(fp="Das ist die richtige Frage. Ich glaube, an Vorschlägen fehlt es nicht, sondern an Mehrheiten.",
                 pv="Das ist die richtige Frage. An Vorschlägen fehlt es nicht, sondern an Mehrheiten."),
}
