import { useState, useRef, useEffect, useMemo } from "react";

const STORAGE_KEY = "cineswipe-v4";

const GENRE_COLORS = {
  "Sci-Fi":   { grad: "160deg,#080e28 0%,#0f1a52 60%,#070c1f 100%", accent: "#6366f1" },
  "Thriller": { grad: "160deg,#180404 0%,#380808 60%,#130303 100%", accent: "#ef4444" },
  "Drama":    { grad: "160deg,#0c0c1e 0%,#1a1a40 60%,#0c0c1e 100%", accent: "#a78bfa" },
  "Horror":   { grad: "160deg,#04100a 0%,#082010 60%,#040d07 100%", accent: "#4ade80" },
  "Mystery":  { grad: "160deg,#0c0812 0%,#1a1028 60%,#0c0812 100%", accent: "#c084fc" },
  "Fantasy":  { grad: "160deg,#0d0510 0%,#1e0a24 60%,#0d0510 100%", accent: "#e879f9" },
  "Action":   { grad: "160deg,#150608 0%,#301014 60%,#130506 100%", accent: "#fb923c" },
};

const CATS = {
  love:      { label:"Me encanta",      emoji:"❤️",  color:"#ef4444" },
  fine:      { label:"Está bien",       emoji:"👍",  color:"#f59e0b" },
  dislike:   { label:"No me gustó",     emoji:"👎",  color:"#6b7280" },
  unknown:   { label:"No la conozco",   emoji:"🤷",  color:"#4b5563" },
  skip:      { label:"Decidí no verla", emoji:"🚫",  color:"#374151" },
  watchlist: { label:"La quiero ver",   emoji:"⭐",  color:"#10b981" },
};

const BASE_MOVIES = [
  { id:"f01", title:"Seven",                             year:1995, genre:"Thriller", director:"David Fincher",          pitch:"Dos detectives rastrean a un asesino obsesionado con los siete pecados. El thriller definitivo." },
  { id:"f02", title:"Fight Club",                        year:1999, genre:"Thriller", director:"David Fincher",          pitch:"Un hombre sin nombre, un jabón y el mito de Tyler Durden. No la spoileen." },
  { id:"f03", title:"Zodiac",                            year:2007, genre:"Thriller", director:"David Fincher",          pitch:"La investigación del Asesino del Zodiaco durante décadas. Obsesión sin resolución." },
  { id:"f04", title:"Gone Girl",                         year:2014, genre:"Thriller", director:"David Fincher",          pitch:"Una esposa desaparece en su aniversario. Nada es lo que parece. Twisted e inteligente." },
  { id:"v01", title:"Arrival",                           year:2016, genre:"Sci-Fi",   director:"Denis Villeneuve",       pitch:"Tu nuevo top. Lingüista descifra el lenguaje alienígena. El tiempo como nunca lo habías visto." },
  { id:"v02", title:"Prisoners",                         year:2013, genre:"Thriller", director:"Denis Villeneuve",       pitch:"Tu joya. Un padre busca a su hija desaparecida. Moral y tensión sin respiro." },
  { id:"v03", title:"Sicario",                           year:2015, genre:"Thriller", director:"Denis Villeneuve",       pitch:"Operación antinarcóticos en la frontera. Tenso, ambiguo, visualmente brutal." },
  { id:"v04", title:"Incendies",                         year:2010, genre:"Drama",    director:"Denis Villeneuve",       pitch:"Dos gemelos descubren la historia de su madre muerta. Una de las mejores del siglo." },
  { id:"n01", title:"Inception",                         year:2010, genre:"Sci-Fi",   director:"Christopher Nolan",      pitch:"Robar secretos dentro de sueños dentro de sueños. Construcción de reloj suizo total." },
  { id:"n02", title:"The Prestige",                      year:2006, genre:"Mystery",  director:"Christopher Nolan",      pitch:"Dos magos rivales se destruyen mutuamente. Estructura perfecta." },
  { id:"n03", title:"Memento",                           year:2000, genre:"Thriller", director:"Christopher Nolan",      pitch:"Un hombre sin memoria corta investiga el asesinato de su esposa. Narrada al revés." },
  { id:"n04", title:"Interstellar",                      year:2014, genre:"Sci-Fi",   director:"Christopher Nolan",      pitch:"Astronautas buscan un nuevo hogar para la humanidad. Lloras con conceptos físicos." },
  { id:"a01", title:"Black Swan",                        year:2010, genre:"Thriller", director:"Darren Aronofsky",       pitch:"Una bailarina se desintegra persiguiendo la perfección. Perturbadora e hipnótica." },
  { id:"a02", title:"Requiem for a Dream",               year:2000, genre:"Drama",    director:"Darren Aronofsky",       pitch:"Cuatro personas destruidas por sus adicciones. La más difícil de ver de esta lista." },
  { id:"a03", title:"Pi",                                year:1998, genre:"Thriller", director:"Darren Aronofsky",       pitch:"Un matemático obsesionado busca un patrón en todo el universo. Primer Aronofsky, B&N." },
  { id:"ag1", title:"Ex Machina",                        year:2014, genre:"Sci-Fi",   director:"Alex Garland",           pitch:"IA, poder, manipulación. Pequeña pero perfecta. Ya la viste y te pareció genial." },
  { id:"ag2", title:"Annihilation",                      year:2018, genre:"Sci-Fi",   director:"Alex Garland",           pitch:"Zona misteriosa que transforma todo. Visualmente impresionante, algo lenta según tú." },
  { id:"ag3", title:"Devs",                              year:2020, genre:"Sci-Fi",   director:"Alex Garland",           pitch:"Miniserie. Determinismo, tecnología, thriller. Muy cercana a Ex Machina en tono." },
  { id:"k01", title:"2001: A Space Odyssey",             year:1968, genre:"Sci-Fi",   director:"Stanley Kubrick",        pitch:"El origen del cine de ciencia ficción. HAL 9000. La monolito. Kubrick absoluto." },
  { id:"k02", title:"The Shining",                       year:1980, genre:"Horror",   director:"Stanley Kubrick",        pitch:"Un escritor enlouquece en un hotel aislado. Jack Nicholson histórico." },
  { id:"k03", title:"A Clockwork Orange",                year:1971, genre:"Sci-Fi",   director:"Stanley Kubrick",        pitch:"Violencia, libre albedrío y el Estado. Perturbadora y filosófica en partes iguales." },
  { id:"k04", title:"Full Metal Jacket",                 year:1987, genre:"Drama",    director:"Stanley Kubrick",        pitch:"Dos mitades: el entrenamiento y Vietnam. La primera hora es perfecta." },
  { id:"s01", title:"Goodfellas",                        year:1990, genre:"Thriller", director:"Martin Scorsese",        pitch:"La vida del crimen organizado desde adentro. El mejor Scorsese. Energía pura." },
  { id:"s02", title:"Taxi Driver",                       year:1976, genre:"Thriller", director:"Martin Scorsese",        pitch:"Un veterano alienado decide limpiar las calles de Nueva York. De Niro icónico." },
  { id:"s03", title:"The Departed",                      year:2006, genre:"Thriller", director:"Martin Scorsese",        pitch:"Policía infiltrado en la mafia y mafioso infiltrado en la policía. Oscar merecido." },
  { id:"b01", title:"Parasite",                          year:2019, genre:"Thriller", director:"Bong Joon-ho",           pitch:"Una familia pobre se infiltra en una rica. Cambia de género cada 30 minutos. Palme d'Or + Oscar." },
  { id:"b02", title:"Memories of Murder",                year:2003, genre:"Thriller", director:"Bong Joon-ho",           pitch:"Los primeros asesinos seriales en Corea del Sur. Investigación real, final que rompe." },
  { id:"b03", title:"Snowpiercer",                       year:2013, genre:"Sci-Fi",   director:"Bong Joon-ho",           pitch:"Un tren que nunca para y la lucha de clases a bordo. Alegoría feroz." },
  { id:"p01", title:"Oldboy",                            year:2003, genre:"Thriller", director:"Park Chan-wook",         pitch:"Un hombre despierta tras 15 años de confinamiento sin saber por qué. El giro más perturbador del cine." },
  { id:"p02", title:"The Handmaiden",                    year:2016, genre:"Thriller", director:"Park Chan-wook",         pitch:"Intrigas y engaños en el Japón colonial. Park Chan-wook en estado de gracia." },
  { id:"p03", title:"Sympathy for Mr. Vengeance",        year:2002, genre:"Thriller", director:"Park Chan-wook",         pitch:"El primer capítulo de la trilogía de la venganza. Más fría y más triste que Oldboy." },
  { id:"l01", title:"The Lobster",                       year:2015, genre:"Fantasy",  director:"Yorgos Lanthimos",       pitch:"En un mundo donde los solteros son convertidos en animales. Absurda y filosófica." },
  { id:"l02", title:"Poor Things",                       year:2023, genre:"Fantasy",  director:"Yorgos Lanthimos",       pitch:"Una mujer resucitada explora el mundo desde cero. Bizarra y visualmente única." },
  { id:"l03", title:"The Favourite",                     year:2018, genre:"Drama",    director:"Yorgos Lanthimos",       pitch:"Tres mujeres en la corte de la Reina Ana. Poder, manipulación, humor negro." },
  { id:"pt1", title:"There Will Be Blood",               year:2007, genre:"Drama",    director:"Paul Thomas Anderson",   pitch:"La ambición en el nacimiento del petróleo americano. Daniel Day-Lewis inhumano." },
  { id:"pt2", title:"Magnolia",                          year:1999, genre:"Drama",    director:"Paul Thomas Anderson",   pitch:"Nueve historias entrelazadas en un día en Los Ángeles. Tom Cruise contra su padre." },
  { id:"pt3", title:"Phantom Thread",                    year:2017, genre:"Drama",    director:"Paul Thomas Anderson",   pitch:"Un modisto genial y la mujer que logra dominarlo. DDL en su último papel. Exquisita." },
  { id:"c01", title:"No Country for Old Men",            year:2007, genre:"Thriller", director:"Coen Brothers",          pitch:"Un hombre encuentra dinero del narco. Anton Chigurh es el villano más aterrador jamás filmado." },
  { id:"c02", title:"Fargo",                             year:1996, genre:"Thriller", director:"Coen Brothers",          pitch:"Un secuestro que sale muy mal en Minnesota. Humor negro y nieve. Magistral." },
  { id:"c03", title:"Barton Fink",                       year:1991, genre:"Mystery",  director:"Coen Brothers",          pitch:"Un dramaturgo en Hollywood sufre un bloqueo creativo. Kafkiana y perturbadora." },
  { id:"dl1", title:"Mulholland Drive",                  year:2001, genre:"Mystery",  director:"David Lynch",            pitch:"Una actriz llega a Hollywood. Todo es sueño, todo es real, nada se resuelve del todo." },
  { id:"dl2", title:"Blue Velvet",                       year:1986, genre:"Mystery",  director:"David Lynch",            pitch:"Bajo la superficie perfecta de un pueblo americano vive algo muy oscuro." },
  { id:"dl3", title:"Lost Highway",                      year:1997, genre:"Mystery",  director:"David Lynch",            pitch:"Un músico acusado de asesinar a su esposa. La identidad se disuelve. Lynch puro." },
  { id:"ac1", title:"Children of Men",                   year:2006, genre:"Sci-Fi",   director:"Alfonso Cuarón",         pitch:"Humanidad sin reproducción, una esperanza. Los planos secuencia más tensos del cine." },
  { id:"ac2", title:"Y Tu Mamá También",                 year:2001, genre:"Drama",    director:"Alfonso Cuarón",         pitch:"Dos amigos mexicanos en road trip con una mujer mayor. Coming-of-age brutal y hermoso." },
  { id:"ac3", title:"Gravity",                           year:2013, genre:"Sci-Fi",   director:"Alfonso Cuarón",         pitch:"Una astronauta sola en el espacio. Técnicamente impresionante, emocionalmente sólida." },
  { id:"ai1", title:"Amores Perros",                     year:2000, genre:"Drama",    director:"Alejandro G. Iñárritu",  pitch:"Tres historias unidas por un accidente en la CDMX. La mejor película mexicana contemporánea." },
  { id:"ai2", title:"Birdman",                           year:2014, genre:"Drama",    director:"Alejandro G. Iñárritu",  pitch:"Un superhéroe caído en desgracia monta una obra de teatro. Parece una sola toma. Oscar." },
  { id:"ai3", title:"The Revenant",                      year:2015, genre:"Drama",    director:"Alejandro G. Iñárritu",  pitch:"Un trampero sobrevive lo imposible en el siglo XIX. DiCaprio y una cinematografía brutal." },
  { id:"re1", title:"The Witch",                         year:2015, genre:"Horror",   director:"Robert Eggers",          pitch:"Familia puritana en Nueva Inglaterra y algo oscuro en el bosque. Atmósfera pura." },
  { id:"re2", title:"The Lighthouse",                    year:2019, genre:"Horror",   director:"Robert Eggers",          pitch:"Dos fareros en una roca. Aislamiento, locura y mitología. En blanco y negro perfecto." },
  { id:"re3", title:"Nosferatu",                         year:2024, genre:"Horror",   director:"Robert Eggers",          pitch:"El vampiro original reinventado. Oscura, bella y perturbadora. Eggers en su mejor forma." },
  { id:"jp1", title:"Get Out",                           year:2017, genre:"Horror",   director:"Jordan Peele",           pitch:"Un hombre negro visita a los padres blancos de su novia. Alegoría social y terror que funciona." },
  { id:"jp2", title:"Us",                                year:2019, genre:"Horror",   director:"Jordan Peele",           pitch:"Una familia enfrenta a sus dobles exactos. Simbólica, violenta y bien construida." },
  { id:"jp3", title:"Nope",                              year:2022, genre:"Sci-Fi",   director:"Jordan Peele",           pitch:"Algo en el cielo sobre un rancho de caballos. Peele jugando con el espectáculo y el miedo." },
  { id:"ar1", title:"Hereditary",                        year:2018, genre:"Horror",   director:"Ari Aster",              pitch:"Una familia tras una muerte inesperada. El horror más perturbador de la última década." },
  { id:"ar2", title:"Midsommar",                         year:2019, genre:"Horror",   director:"Ari Aster",              pitch:"Festival folklórico sueco. Terror a plena luz del día. Visualmente impresionante." },
  { id:"ar3", title:"Beau Is Afraid",                    year:2023, genre:"Drama",    director:"Ari Aster",              pitch:"Un hombre intenta llegar a casa de su madre. Pesadilla kafkiana de casi 3 horas." },
  { id:"wa1", title:"The Grand Budapest Hotel",          year:2014, genre:"Drama",    director:"Wes Anderson",           pitch:"Un conserje acusado de asesinato y su fiel lobby boy. Visualmente perfecta como un reloj." },
  { id:"wa2", title:"The Royal Tenenbaums",              year:2001, genre:"Drama",    director:"Wes Anderson",           pitch:"Una familia de ex-genios disfuncionales. Melancólica, divertida, con su propio universo." },
  { id:"wa3", title:"Asteroid City",                     year:2023, genre:"Drama",    director:"Wes Anderson",           pitch:"Su más experimental: una obra dentro de un show de TV dentro de una película." },
  { id:"tm1", title:"The Tree of Life",                  year:2011, genre:"Drama",    director:"Terrence Malick",        pitch:"El origen del universo y una familia texana en los 50s. La más divisiva y la más bella." },
  { id:"tm2", title:"The Thin Red Line",                 year:1998, genre:"Drama",    director:"Terrence Malick",        pitch:"Guadalcanal como meditación sobre la naturaleza y la guerra. La mejor película bélica." },
  { id:"wk1", title:"In the Mood for Love",              year:2000, genre:"Drama",    director:"Wong Kar-wai",           pitch:"Dos vecinos descubren que sus parejas tienen un affaire. El amor reprimido más hermoso del cine." },
  { id:"wk2", title:"Chungking Express",                 year:1994, genre:"Drama",    director:"Wong Kar-wai",           pitch:"Dos historias de amor y policías en Hong Kong. Espontánea, libre y melancólica." },
  { id:"wk3", title:"2046",                              year:2004, genre:"Drama",    director:"Wong Kar-wai",           pitch:"Un escritor busca el amor en el pasado y en un futuro imaginado. Secuela de 'In the Mood'." },
  { id:"gd1", title:"Pan's Labyrinth",                   year:2006, genre:"Fantasy",  director:"Guillermo del Toro",     pitch:"España postguerra y un laberinto mágico que puede o no ser real. Oscura y hermosa." },
  { id:"gd2", title:"The Shape of Water",                year:2017, genre:"Fantasy",  director:"Guillermo del Toro",     pitch:"Una mujer muda se enamora de una criatura acuática. Fábula adulta, visualmente rica." },
  { id:"rl1", title:"Before Sunrise",                    year:1995, genre:"Drama",    director:"Richard Linklater",      pitch:"Un americano y una francesa hablan toda la noche en Viena. El romance más real del cine." },
  { id:"rl2", title:"Boyhood",                           year:2014, genre:"Drama",    director:"Richard Linklater",      pitch:"Una vida filmada en 12 años con los mismos actores. El paso del tiempo como no lo verás igual." },
  { id:"rl3", title:"A Scanner Darkly",                  year:2006, genre:"Sci-Fi",   director:"Richard Linklater",      pitch:"Rotoscopia + Philip K. Dick + paranoia de las drogas. Keanu Reeves en su mejor papel." },
  { id:"sc1", title:"Lost in Translation",               year:2003, genre:"Drama",    director:"Sofia Coppola",          pitch:"Dos personas fuera de lugar en Tokio. Soledad, conexión silenciosa, Scarlett Johansson." },
  { id:"sc2", title:"The Virgin Suicides",               year:1999, genre:"Drama",    director:"Sofia Coppola",          pitch:"Cinco hermanas observadas por sus vecinos. Misteriosa, melancólica, banda sonora perfecta." },
  { id:"rs1", title:"Blade Runner",                      year:1982, genre:"Sci-Fi",   director:"Ridley Scott",           pitch:"El noir futurista que definió cómo imaginamos el futuro. Harrison Ford y replicantes." },
  { id:"rs2", title:"Alien",                             year:1979, genre:"Horror",   director:"Ridley Scott",           pitch:"Un equipo en el espacio y algo que no debería estar a bordo. Terror perfecto." },
  { id:"lc1", title:"Burning",                           year:2018, genre:"Mystery",  director:"Lee Chang-dong",         pitch:"Un triángulo entre un escritor, una chica y un misterioso joven rico. Kafka en Corea." },
  { id:"lc2", title:"Poetry",                            year:2010, genre:"Drama",    director:"Lee Chang-dong",         pitch:"Una abuela con Alzheimer descubre la poesía mientras lidia con lo que hizo su nieto." },
  { id:"mm1", title:"Heat",                              year:1995, genre:"Thriller", director:"Michael Mann",           pitch:"Detective y ladrón en juego del gato y el ratón. Al Pacino y De Niro. Épica total." },
  { id:"mm2", title:"Collateral",                        year:2004, genre:"Thriller", director:"Michael Mann",           pitch:"Un taxista conduce a un asesino a sueldo por Los Ángeles una noche. Tom Cruise en gris." },
  { id:"mh1", title:"Caché",                             year:2005, genre:"Thriller", director:"Michael Haneke",         pitch:"Una familia recibe videos de vigilancia de su propia casa. Tensa, ambigua, sin resolución." },
  { id:"mh2", title:"The White Ribbon",                  year:2009, genre:"Mystery",  director:"Michael Haneke",         pitch:"Un pueblo alemán antes de la guerra y sucesos inexplicables. La semilla del fascismo." },
  { id:"jg1", title:"Under the Skin",                    year:2013, genre:"Sci-Fi",   director:"Jonathan Glazer",        pitch:"Una alienígena seduce a hombres en Escocia. Scarlett Johansson. Perturbadora y única." },
  { id:"jg2", title:"The Zone of Interest",              year:2023, genre:"Drama",    director:"Jonathan Glazer",        pitch:"La familia del comandante de Auschwitz y su vida cotidiana. Horror sin mostrarlo." },
  { id:"ck1", title:"Being John Malkovich",              year:1999, genre:"Mystery",  director:"Charlie Kaufman",        pitch:"Un portal lleva a la mente de John Malkovich. Completamente insana y brillante." },
  { id:"ck2", title:"Synecdoche, New York",              year:2008, genre:"Drama",    director:"Charlie Kaufman",        pitch:"Un director construye una réplica de Nueva York en un almacén. La más devastadora del cine." },
  { id:"sca", title:"Primer",                            year:2004, genre:"Sci-Fi",   director:"Shane Carruth",          pitch:"Dos ingenieros inventan una máquina del tiempo en su garaje. La más críptica del género." },
  { id:"scb", title:"Upstream Color",                    year:2013, genre:"Mystery",  director:"Shane Carruth",          pitch:"Un ciclo de vida extraño une a dos personas. Experimental, visceral, única." },
  { id:"mn1", title:"The Sixth Sense",                   year:1999, genre:"Mystery",  director:"M. Night Shyamalan",     pitch:"El giro más famoso del cine. Si no la has visto: sin googlear absolutamente nada." },
  { id:"mn2", title:"Unbreakable",                       year:2000, genre:"Drama",    director:"M. Night Shyamalan",     pitch:"La mejor película de superhéroes aunque no lo parece. Muy subestimada." },
  { id:"mn3", title:"Split",                             year:2016, genre:"Thriller", director:"M. Night Shyamalan",     pitch:"Un hombre con 23 personalidades secuestra a tres chicas. James McAvoy desbordante." },
  { id:"rj1", title:"Knives Out",                        year:2019, genre:"Mystery",  director:"Rian Johnson",           pitch:"La muerte de un escritor millonario. El whodunnit reinventado. Muy inteligente." },
  { id:"rj2", title:"Glass Onion",                       year:2022, genre:"Mystery",  director:"Rian Johnson",           pitch:"Benoit Blanc en una isla de millonarios tech. Quizás mejor que la primera." },
  { id:"sj1", title:"Her",                               year:2013, genre:"Sci-Fi",   director:"Spike Jonze",            pitch:"Un hombre se enamora de su IA. Más sobre soledad y conexión que sobre tecnología." },
  { id:"sj2", title:"Eternal Sunshine of the Spotless Mind", year:2004, genre:"Sci-Fi", director:"Michel Gondry",       pitch:"Un hombre borra a su ex de la memoria. Roto y hermoso al mismo tiempo." },
  { id:"nw1", title:"Drive",                             year:2011, genre:"Thriller", director:"Nicolas Winding Refn",   pitch:"Un chofer silencioso, un golpe que sale mal. Estética impecable, violencia inesperada." },
  { id:"nw2", title:"Only God Forgives",                 year:2013, genre:"Thriller", director:"Nicolas Winding Refn",   pitch:"Bangkok, crimen y una madre. Más radical que Drive, más contemplativa y extraña." },
  { id:"dc1", title:"Whiplash",                          year:2014, genre:"Drama",    director:"Damien Chazelle",        pitch:"Baterista y maestro brutal. La mejor película sobre obsesión y grandeza jamás hecha." },
  { id:"dc2", title:"First Man",                         year:2018, genre:"Drama",    director:"Damien Chazelle",        pitch:"Neil Armstrong como nunca lo habías visto: íntimo, frío y devastador." },
  { id:"gn1", title:"Irréversible",                      year:2002, genre:"Thriller", director:"Gaspar Noé",             pitch:"Narrada al revés. Una de las más difíciles de ver, una de las más necesarias." },
  { id:"gn2", title:"Enter the Void",                    year:2009, genre:"Sci-Fi",   director:"Gaspar Noé",             pitch:"Un traficante muere en Tokio y flota sobre su propia historia. Experiencia visual total." },
  { id:"at1", title:"Stalker",                           year:1979, genre:"Sci-Fi",   director:"Andrei Tarkovsky",       pitch:"Tres hombres viajan a la Zona, donde los deseos se vuelven realidad. Filosófica y lenta." },
  { id:"at2", title:"Solaris",                           year:1972, genre:"Sci-Fi",   director:"Andrei Tarkovsky",       pitch:"Un psicólogo en una estación espacial que materializa los recuerdos de los tripulantes." },
  { id:"pp1", title:"Ida",                               year:2013, genre:"Drama",    director:"Pawel Pawlikowski",      pitch:"Una novicia descubre que es judía antes de tomar sus votos. En blanco y negro perfecto." },
  { id:"pp2", title:"Cold War",                          year:2018, genre:"Drama",    director:"Pawel Pawlikowski",      pitch:"Amor imposible entre Polonia y Francia durante la Guerra Fría. 90 minutos perfectos." },
  { id:"hk1", title:"Shoplifters",                       year:2018, genre:"Drama",    director:"Hirokazu Kore-eda",      pitch:"Una familia marginal japonesa que roba para sobrevivir. Lo que hace una familia." },
  { id:"hk2", title:"Monster",                           year:2023, genre:"Mystery",  director:"Hirokazu Kore-eda",      pitch:"El mismo incidente visto desde tres perspectivas. La verdad como algo construido." },
  { id:"rh1", title:"Drive My Car",                      year:2021, genre:"Drama",    director:"Ryûsuke Hamaguchi",      pitch:"Un director de teatro procesa el duelo con su chofer. Tres horas que pasan volando." },
  { id:"rh2", title:"Wheel of Fortune and Fantasy",      year:2021, genre:"Drama",    director:"Ryûsuke Hamaguchi",      pitch:"Tres historias sobre el azar, el amor y el malentendido. Delicada y precisa." },
  { id:"x01", title:"The Matrix",                        year:1999, genre:"Sci-Fi",   director:"Las Wachowski",          pitch:"Tu top 2. Neo, la pastilla roja y la realidad que no es lo que parece." },
  { id:"x02", title:"Everything Everywhere All at Once", year:2022, genre:"Sci-Fi",   director:"Daniels",                pitch:"Tu obra maestra. Multiverso, familia, todo todo todo." },
  { id:"x03", title:"Little Miss Sunshine",              year:2006, genre:"Drama",    director:"Jonathan Dayton",        pitch:"Ya la viste. Familia disfuncional en road trip. Humor crudo, corazón enorme." },
  { id:"x04", title:"Coherence",                         year:2013, genre:"Sci-Fi",   director:"James Ward Byrkit",      pitch:"Tu cine guerrilla favorito. Una cena, un cometa, múltiples realidades." },
  { id:"x05", title:"Predestination",                    year:2014, genre:"Sci-Fi",   director:"Spierig Brothers",       pitch:"La paradoja temporal más cerrada del género. Ya la viste y te pareció genial." },
  { id:"x06", title:"Donnie Darko",                      year:2001, genre:"Mystery",  director:"Richard Kelly",          pitch:"Un adolescente recibe mensajes de un conejo gigante sobre el fin del mundo. Culto total." },
  { id:"x07", title:"District 9",                        year:2009, genre:"Sci-Fi",   director:"Neill Blomkamp",         pitch:"Aliens refugiados en Johannesburgo. Alegoría del apartheid disfrazada de sci-fi de acción." },
  { id:"x08", title:"Timecrimes",                        year:2007, genre:"Sci-Fi",   director:"Nacho Vigalondo",        pitch:"Un hombre viaja una hora al pasado por accidente. Española, guerrilla, perfecta." },
  { id:"x09", title:"The One I Love",                    year:2014, genre:"Mystery",  director:"Charlie McDowell",       pitch:"Una pareja en crisis hace un descubrimiento en su casa de retiro. No googles nada." },
  { id:"x10", title:"Gattaca",                           year:1997, genre:"Sci-Fi",   director:"Andrew Niccol",          pitch:"Un mundo donde el ADN determina tu destino. Elegante, filosófica, visualmente impecable." },
  { id:"x11", title:"Contact",                           year:1997, genre:"Sci-Fi",   director:"Robert Zemeckis",        pitch:"Una científica recibe una señal extraterrestre. Fe vs. ciencia. El espíritu de Arrival." },
  { id:"x12", title:"Shutter Island",                    year:2010, genre:"Thriller", director:"Martin Scorsese",        pitch:"Detective en hospital psiquiátrico. Scorsese jugando contigo. DiCaprio." },
  { id:"x13", title:"Enemy",                             year:2013, genre:"Mystery",  director:"Denis Villeneuve",       pitch:"Un profesor descubre a su doble exacto. Perturbadora, ambigua. Con tu perfil: la vas a amar." },
  { id:"x14", title:"Moon",                              year:2009, genre:"Sci-Fi",   director:"Duncan Jones",           pitch:"Un astronauta solo en una base lunar hace un descubrimiento perturbador. Sam Rockwell solo." },
  { id:"x15", title:"The Truman Show",                   year:1998, genre:"Drama",    director:"Peter Weir",             pitch:"Un hombre descubre que su vida entera es un show de TV. Jim Carrey serio y profundo." },
  { id:"x16", title:"Dark City",                         year:1998, genre:"Sci-Fi",   director:"Alex Proyas",            pitch:"Noir futurista donde los recuerdos se reconstruyen cada noche. Matrix le debe mucho." },
  { id:"x17", title:"Looper",                            year:2012, genre:"Sci-Fi",   director:"Rian Johnson",           pitch:"En el futuro, matas personas enviadas del pasado. Incluido tú mismo." },
  { id:"x18", title:"Source Code",                       year:2011, genre:"Sci-Fi",   director:"Duncan Jones",           pitch:"Un soldado revive los últimos 8 minutos de una vida ajena para encontrar al asesino." },
  { id:"x19", title:"Edge of Tomorrow",                  year:2014, genre:"Sci-Fi",   director:"Doug Liman",             pitch:"Un soldado revive el mismo día de batalla hasta dominarlo. Tom Cruise en su mejor forma." },
  { id:"x20", title:"The Usual Suspects",                year:1995, genre:"Thriller", director:"Bryan Singer",           pitch:"Cinco criminales en una redada. Keyser Söze. El giro que lo cambió todo." },
  { id:"x21", title:"L.A. Confidential",                 year:1997, genre:"Thriller", director:"Curtis Hanson",          pitch:"Corrupción policial en el Hollywood de los 50s. Noir perfecto." },
  { id:"x22", title:"The Secret in Their Eyes",          year:2009, genre:"Thriller", director:"Juan José Campanella",   pitch:"Detective argentino obsesionado con un caso sin resolver. Giro final brutal." },
  { id:"x23", title:"City of God",                       year:2002, genre:"Thriller", director:"Fernando Meirelles",     pitch:"El crimen en las favelas de Río desde los 60s. Energía, estilo, corazón." },
  { id:"x24", title:"A Prophet",                         year:2009, genre:"Thriller", director:"Jacques Audiard",        pitch:"Un joven árabe aprende a dominar la prisión francesa. Épica moderna de crimen." },
  { id:"x25", title:"Chinatown",                         year:1974, genre:"Mystery",  director:"Roman Polanski",         pitch:"El noir definitivo. Jack Nicholson. Un giro final que no te abandona." },
  { id:"x26", title:"The Conversation",                  year:1974, genre:"Thriller", director:"Francis Ford Coppola",   pitch:"Un experto en vigilancia graba algo que no debería. Paranoia perfecta de Coppola." },
  { id:"x27", title:"Nightcrawler",                      year:2014, genre:"Thriller", director:"Dan Gilroy",             pitch:"Un hombre sin moral filma accidentes para venderlos a noticieros. Jake Gyllenhaal perturbador." },
  { id:"x28", title:"10 Cloverfield Lane",               year:2016, genre:"Thriller", director:"Dan Trachtenberg",       pitch:"Una mujer despierta en un búnker. El hombre que la salvó puede ser peor que lo de afuera." },
  { id:"x29", title:"Sunshine",                          year:2007, genre:"Sci-Fi",   director:"Danny Boyle",            pitch:"Una tripulación viaja a reencender el sol. Existencial y brutal. Primer acto perfecto." },
  { id:"x30", title:"The Father",                        year:2020, genre:"Drama",    director:"Florian Zeller",         pitch:"Un anciano con demencia. La película te hace vivir su confusión. Anthony Hopkins histórico." },
  { id:"x31", title:"All Quiet on the Western Front",    year:2022, genre:"Drama",    director:"Edward Berger",          pitch:"La guerra desde los ojos de un joven soldado alemán. Brutal, hermosa y necesaria." },
  { id:"x32", title:"Oppenheimer",                       year:2023, genre:"Drama",    director:"Christopher Nolan",      pitch:"El padre de la bomba atómica. Nolan con 3 horas de material denso. Cillian Murphy histórico." },
  { id:"x33", title:"The Holdovers",                     year:2023, genre:"Drama",    director:"Alexander Payne",        pitch:"Un profesor gruñón y un estudiante solos en Navidad. Humor seco, corazón enorme." },
  { id:"x34", title:"The Substance",                     year:2024, genre:"Horror",   director:"Coralie Fargeat",        pitch:"Una celebrity toma una sustancia que crea una versión mejorada de ella. Body horror extremo." },
  { id:"x35", title:"American History X",                year:1998, genre:"Drama",    director:"Tony Kaye",              pitch:"Un neo-nazi sale de prisión convertido. Edward Norton histórico. Difícil y necesaria." },
  { id:"x36", title:"The Dark Knight",                   year:2008, genre:"Action",   director:"Christopher Nolan",      pitch:"Heath Ledger como el Joker. No es de superhéroes, es un thriller sobre el caos." },
  { id:"x37", title:"Calibre",                           year:2018, genre:"Thriller", director:"Matt Palmer",            pitch:"Un accidente de caza en Escocia y sus consecuencias morales. Tensa, concisa, brutal." },
  { id:"x38", title:"The Endless",                       year:2017, genre:"Mystery",  director:"Justin Benson",          pitch:"Dos hermanos regresan al culto del que escaparon. Lovecraftiana y aterradora." },
  { id:"x39", title:"Another Earth",                     year:2011, genre:"Sci-Fi",   director:"Mike Cahill",            pitch:"Aparece un planeta idéntico a la Tierra. La historia es sobre culpa y perdón." },
  { id:"x40", title:"Tenet",                             year:2020, genre:"Sci-Fi",   director:"Christopher Nolan",      pitch:"Espionaje con tiempo inverso. Confusa en el mejor sentido posible." },
  { id:"x41", title:"Blade Runner 2049",                 year:2017, genre:"Sci-Fi",   director:"Denis Villeneuve",       pitch:"Ya la viste. Más atmósfera que historia, pero visualmente perfecta." },
  { id:"x42", title:"Dune: Part Two",                    year:2024, genre:"Sci-Fi",   director:"Denis Villeneuve",       pitch:"Ya la viste. Mucho mejor que la primera. Cinematografía y audio de otro nivel." },
  { id:"x43", title:"Dune: Part One",                    year:2021, genre:"Sci-Fi",   director:"Denis Villeneuve",       pitch:"Ya la viste. Solo el prólogo de una épica enorme. No te convenció mucho." },
  { id:"x44", title:"Minority Report",                   year:2002, genre:"Sci-Fi",   director:"Steven Spielberg",       pitch:"Policías que arrestan asesinos antes de que actúen. Spielberg en modo serio." },
  { id:"x45", title:"Annihilation",                      year:2018, genre:"Sci-Fi",   director:"Alex Garland",           pitch:"Zona misteriosa que transforma todo. Visualmente impresionante, algo lenta según tú." },
];

const INITIAL_DECISIONS = {
  f01:"love", x01:"love", n01:"love", v01:"love", v02:"love",
  x02:"love", x04:"love", x05:"love", ag1:"love",
  x03:"fine", ag2:"fine", x41:"fine", x42:"fine",
  x43:"dislike",
};

function interleaveMovies(movies) {
  const byDir = {};
  movies.forEach(m => {
    if (!byDir[m.director]) byDir[m.director] = [];
    byDir[m.director].push(m);
  });
  const queues = Object.values(byDir);
  queues.forEach(q => {
    for (let i = q.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [q[i], q[j]] = [q[j], q[i]];
    }
  });
  const result = [];
  let lastDir = null;
  while (queues.some(q => q.length > 0)) {
    const nonEmpty = queues.filter(q => q.length > 0);
    const avail = nonEmpty.filter(q => q[0].director !== lastDir);
    const pool = avail.length > 0 ? avail : nonEmpty;
    pool.sort((a, b) => b.length - a.length);
    const movie = pool[0].shift();
    result.push(movie);
    lastDir = movie.director;
  }
  return result;
}

// Deduplicate removing x45 (dupe of ag2) at runtime
const DEDUPED_BASE = BASE_MOVIES.filter(m => m.id !== "x45");
const ORDERED_MOVIES = interleaveMovies([...DEDUPED_BASE]);

export default function CineSwipe() {
  const [decisions, setDecisions] = useState(null);
  const [extraMovies, setExtraMovies] = useState([]);
  const [view, setView] = useState("swipe");
  const [listFilter, setListFilter] = useState("all");
  const [drag, setDrag] = useState({ x: 0, active: false });
  const [exiting, setExiting] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [history, setHistory] = useState([]);
  const startX = useRef(0);

  const allMovies = useMemo(() => {
    if (extraMovies.length === 0) return ORDERED_MOVIES;
    return [...ORDERED_MOVIES, ...interleaveMovies([...extraMovies])];
  }, [extraMovies.length]);

  const undecided = allMovies.filter(m => decisions && !decisions[m.id]);
  const current = undecided[0];
  const next1   = undecided[1];
  const next2   = undecided[2];

 useEffect(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      setDecisions(data.decisions || INITIAL_DECISIONS);
      setExtraMovies(data.extraMovies || []);
    } else {
      setDecisions(INITIAL_DECISIONS);
    }
  } catch {
    setDecisions(INITIAL_DECISIONS);
  }
}, []);

  useEffect(() => {
  if (!decisions) return;
  setSaveStatus("saving");
  const t = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ decisions, extraMovies, v: 3 }));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 1800);
    } catch { setSaveStatus(null); }
  }, 700);
  return () => clearTimeout(t);
}, [decisions, extraMovies]);
  const decide = (id, cat, dir) => {
    setHistory(h => [...h.slice(-29), { id, prev: decisions?.[id] ?? null }]);
    if (dir) {
      setExiting({ dir });
      setTimeout(() => {
        setDecisions(p => ({ ...p, [id]: cat }));
        setDrag({ x: 0, active: false });
        setExiting(null);
      }, 300);
    } else {
      setDecisions(p => ({ ...p, [id]: cat }));
    }
  };

  const undo = () => {
    if (!history.length) return;
    const { id, prev } = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setDecisions(p => {
      const next = { ...p };
      if (prev === null) delete next[id];
      else next[id] = prev;
      return next;
    });
  };

  const onPD = e => {
    if (!current) return;
    startX.current = e.clientX;
    setDrag({ x: 0, active: true });
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPM = e => { if (drag.active) setDrag({ x: e.clientX - startX.current, active: true }); };
  const onPU = () => {
    if (!drag.active || !current) return;
    if      (drag.x >  90) decide(current.id, "watchlist", "right");
    else if (drag.x < -90) decide(current.id, "skip", "left");
    else setDrag({ x: 0, active: false });
  };

  const loadMore = async () => {
    if (!decisions) return;
    setLoadingAI(true);
    setAiError(null);
    const loved    = allMovies.filter(m => decisions[m.id] === "love").map(m => m.title);
    const liked    = allMovies.filter(m => decisions[m.id] === "fine").map(m => m.title);
    const disliked = allMovies.filter(m => decisions[m.id] === "dislike").map(m => m.title);
    const existing = allMovies.map(m => m.title);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loved, liked, disliked, existing }),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const { movies } = await res.json();
      setExtraMovies(prev => [...prev, ...movies.map((m, i) => ({ ...m, id: `ai-${Date.now()}-${i}`, genre: m.genre || "Drama" }))]);
    } catch (e) {
      console.error("AI load failed", e);
      setAiError("No se pudieron cargar recomendaciones. Verifica la configuración del servidor.");
      setTimeout(() => setAiError(null), 5000);
    }
    setLoadingAI(false);
  };

  // Keep fresh refs so keyboard handler never has stale closures
  const decideRef = useRef(decide);
  decideRef.current = decide;
  const undoRef = useRef(undo);
  undoRef.current = undo;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = e => {
      if (view !== "swipe" || !current) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const catKeys = { "1":"love", "2":"fine", "3":"dislike", "4":"unknown", "5":"skip", "6":"watchlist" };
      if (e.key === "ArrowRight") { e.preventDefault(); decideRef.current(current.id, "watchlist", "right"); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); decideRef.current(current.id, "skip", "left"); }
      else if (catKeys[e.key]) {
        const cat = catKeys[e.key];
        const dir = (cat === "love" || cat === "fine" || cat === "watchlist") ? "right" : "left";
        decideRef.current(current.id, cat, dir);
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undoRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, view]);

  const gs     = current ? (GENRE_COLORS[current.genre] || GENRE_COLORS.Drama) : null;
  const swipeR = Math.max(0, Math.min(1, drag.x / 100));
  const swipeL = Math.max(0, Math.min(1, -drag.x / 100));
  const rotate = drag.x * 0.1;
  const decided = decisions ? Object.keys(decisions).length : 0;
  const total   = allMovies.length;
  const progress = Math.round((decided / total) * 100);

  const getProfile = () => {
    if (!decisions) return null;
    const genreScore = {}, dirScore = {}, catCount = {};
    allMovies.forEach(m => {
      const d = decisions[m.id];
      if (!d) return;
      catCount[d] = (catCount[d] || 0) + 1;
      if (d === "love" || d === "fine") {
        const w = d === "love" ? 2 : 1;
        genreScore[m.genre] = (genreScore[m.genre] || 0) + w;
        dirScore[m.director] = (dirScore[m.director] || 0) + w;
      }
    });
    return {
      topGenres: Object.entries(genreScore).sort((a,b)=>b[1]-a[1]).slice(0,5),
      topDirs:   Object.entries(dirScore).sort((a,b)=>b[1]-a[1]).slice(0,6),
      catCount,
    };
  };
  const profile = getProfile();

  if (!decisions) return (
    <div style={{ minHeight:"100dvh", background:"#070707", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:"#666", fontSize:12, fontFamily:"'DM Sans',sans-serif" }}>Cargando tu perfil…</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100dvh", background:"#070707", color:"#e8e8e8", fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", maxWidth:430, margin:"0 auto", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        button{font-family:'DM Sans',sans-serif}
        ::-webkit-scrollbar{display:none}
      `}</style>

      {/* HEADER */}
      <div style={{ width:"100%", padding:"16px 16px 6px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:21, color:"#f0e6d0", letterSpacing:"-0.5px" }}>CineSwipe 🎬</div>
          <div style={{ fontSize:9.5, color:"#666", marginTop:2, display:"flex", alignItems:"center", gap:5 }}>
            <span>{undecided.length} pendientes · {decided}/{total}</span>
            {saveStatus==="saving" && <span style={{color:"#555"}}> · guardando…</span>}
            {saveStatus==="saved"  && <span style={{color:"#4ade80"}}> · ✓ guardado</span>}
            {history.length > 0 && (
              <button onClick={undo} style={{background:"none",border:"none",color:"#555",fontSize:9.5,cursor:"pointer",padding:"0 3px",textDecoration:"underline",fontFamily:"'DM Sans',sans-serif"}}>
                ↩ deshacer
              </button>
            )}
          </div>
        </div>
        <div style={{ display:"flex", gap:5 }}>
          {[["swipe","Swipe"],["list","Lista"],["profile","Perfil"]].map(([v,label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              background: view===v ? "#c8b88a" : "#0e0e0e",
              color: view===v ? "#070707" : "#888",
              border:`1px solid ${view===v?"#c8b88a":"#2a2a2a"}`,
              borderRadius:18, padding:"6px 11px", fontSize:10.5,
              cursor:"pointer", fontWeight: view===v?600:400, transition:"all 0.18s",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* PROGRESS */}
      <div style={{ width:"100%", padding:"0 16px 4px" }}>
        <div style={{ height:1.5, background:"#111", borderRadius:2 }}>
          <div style={{ height:"100%", borderRadius:2, width:`${progress}%`, background:"linear-gradient(90deg,#7c6030,#c8b88a)", transition:"width 0.6s ease" }} />
        </div>
      </div>

      {/* ── SWIPE ── */}
      {view === "swipe" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", width:"100%", padding:"8px 14px 20px" }}>
          {current ? (
            <>
              <div style={{ position:"relative", width:"100%", height:440, marginBottom:14 }}>
                {next2 && (() => { const g=GENRE_COLORS[next2.genre]||GENRE_COLORS.Drama; return <div style={{position:"absolute",inset:0,borderRadius:22,background:`linear-gradient(${g.grad})`,transform:"scale(0.90) translateY(20px)",opacity:0.28}} />; })()}
                {next1 && (() => { const g=GENRE_COLORS[next1.genre]||GENRE_COLORS.Drama; return <div style={{position:"absolute",inset:0,borderRadius:22,background:`linear-gradient(${g.grad})`,transform:"scale(0.95) translateY(10px)",opacity:0.48}} />; })()}

                <div onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerCancel={onPU} style={{
                  position:"absolute", inset:0, borderRadius:22,
                  background:`linear-gradient(${gs.grad})`,
                  border:"1px solid #1e1e1e",
                  boxShadow:"0 20px 60px rgba(0,0,0,0.7)",
                  cursor: drag.active?"grabbing":"grab", userSelect:"none",
                  transform: exiting
                    ? `translateX(${exiting.dir==="right"?"130%":"-130%"}) rotate(${exiting.dir==="right"?16:-16}deg)`
                    : `translateX(${drag.x}px) rotate(${rotate}deg)`,
                  transition: exiting ? "transform 0.3s cubic-bezier(0.6,0,1,0.4)"
                    : drag.active ? "none" : "transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275)",
                  display:"flex", flexDirection:"column", overflow:"hidden",
                }}>
                  <div style={{position:"absolute",top:20,left:14,zIndex:10,background:"#10b981",color:"#fff",padding:"4px 12px",borderRadius:7,fontSize:11,fontWeight:600,opacity:swipeR,transform:"rotate(-14deg)",pointerEvents:"none"}}>⭐ VER</div>
                  <div style={{position:"absolute",top:20,right:14,zIndex:10,background:"#374151",color:"#fff",padding:"4px 12px",borderRadius:7,fontSize:11,fontWeight:600,opacity:swipeL,transform:"rotate(14deg)",pointerEvents:"none"}}>🚫 PASO</div>
                  <div style={{position:"absolute",top:18,left:"50%",transform:"translateX(-50%)",zIndex:5,background:"rgba(0,0,0,0.5)",border:`1px solid ${gs.accent}50`,color:gs.accent,padding:"3px 11px",borderRadius:20,fontSize:9,fontWeight:500,letterSpacing:1.5,textTransform:"uppercase",backdropFilter:"blur(6px)",pointerEvents:"none",whiteSpace:"nowrap"}}>{current.genre}</div>
                  {current.id?.startsWith("ai-") && <div style={{position:"absolute",top:18,right:46,zIndex:10,background:"rgba(99,102,241,0.15)",color:"#818cf8",border:"1px solid #4f46e540",padding:"2px 7px",borderRadius:5,fontSize:9,pointerEvents:"none"}}>✦ IA</div>}
                  <div style={{position:"absolute",top:-50,right:-50,width:180,height:180,borderRadius:"50%",background:gs.accent,opacity:0.07,filter:"blur(40px)",pointerEvents:"none"}} />
                  <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"68px 20px 22px",background:"linear-gradient(to top,rgba(0,0,0,0.93) 0%,rgba(0,0,0,0.45) 50%,transparent 100%)",pointerEvents:"none"}}>
                    <div style={{fontSize:10,color:"#777",marginBottom:4}}>{current.director} · {current.year}</div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,lineHeight:1.2,color:"#f0e6d0",marginBottom:8}}>{current.title}</div>
                    <div style={{fontSize:12.5,color:"#bbb",lineHeight:1.55}}>{current.pitch}</div>
                  </div>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:5,width:"100%"}}>
                {Object.entries(CATS).map(([key,cat]) => (
                  <button key={key} onClick={() => {
                    const dir = (key === "love" || key === "fine" || key === "watchlist") ? "right" : "left";
                    decide(current.id, key, dir);
                  }} style={{background:"#0e0e0e",border:"1px solid #181818",borderRadius:12,padding:"9px 3px 7px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"background 0.1s"}}
                    onPointerDown={e=>e.currentTarget.style.background="#181818"}
                    onPointerUp={e=>e.currentTarget.style.background="#0e0e0e"}
                    onPointerLeave={e=>e.currentTarget.style.background="#0e0e0e"}
                  >
                    <span style={{fontSize:19,lineHeight:1}}>{cat.emoji}</span>
                    <span style={{fontSize:7.5,color:"#777",textAlign:"center",lineHeight:1.25}}>{cat.label}</span>
                  </button>
                ))}
              </div>
              <div style={{fontSize:9.5,color:"#555",marginTop:10,textAlign:"center"}}>→ ⭐ ver &nbsp;·&nbsp; ← 🚫 pasar &nbsp;·&nbsp; teclas 1–6</div>
              {undecided.length < 8 && (
                <button onClick={loadMore} disabled={loadingAI} style={{marginTop:10,background:"transparent",border:"1px solid #2a2a2a",color:loadingAI?"#444":"#888",borderRadius:20,padding:"6px 16px",fontSize:10.5,cursor:loadingAI?"default":"pointer"}}>
                  {loadingAI?"✦ Generando…":`✦ Quedan ${undecided.length} — cargar más con IA`}
                </button>
              )}
            </>
          ) : (
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,textAlign:"center",padding:20}}>
              <div style={{fontSize:52}}>🎬</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"#f0e6d0"}}>Lista agotada</div>
              <div style={{fontSize:12,color:"#666",lineHeight:1.6}}>Clasificaste todo lo disponible.<br/>¿Cargamos más con IA?</div>
              <button onClick={loadMore} disabled={loadingAI} style={{background:loadingAI?"#111":"#c8b88a",color:loadingAI?"#333":"#070707",border:"none",borderRadius:22,padding:"12px 28px",fontSize:13,cursor:loadingAI?"default":"pointer",fontWeight:500}}>
                {loadingAI?"Generando…":"✦ Cargar 15 más con IA"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── LISTA ── */}
      {view === "list" && (
        <div style={{flex:1,width:"100%",padding:"6px 14px 24px",overflowY:"auto"}}>
          <div style={{display:"flex",gap:5,marginBottom:10,overflowX:"auto",paddingBottom:2}}>
            {[["all","Todas","#c8b88a"],...Object.entries(CATS).map(([k,v])=>[k,`${v.emoji} ${v.label}`,v.color])].map(([key,label,color])=>{
              const count = key==="all" ? Object.keys(decisions).length : allMovies.filter(m=>decisions[m.id]===key).length;
              return (
                <button key={key} onClick={()=>setListFilter(key)} style={{background:listFilter===key?color:"#0e0e0e",color:listFilter===key?"#070707":"#777",border:`1px solid ${listFilter===key?color:"#2a2a2a"}`,borderRadius:20,padding:"5px 10px",fontSize:10,cursor:"pointer",whiteSpace:"nowrap",fontWeight:listFilter===key?600:400,transition:"all 0.18s"}}>
                  {label} ({count})
                </button>
              );
            })}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {(listFilter==="all"?allMovies.filter(m=>decisions[m.id]):allMovies.filter(m=>decisions[m.id]===listFilter)).map(movie=>{
              const cat=CATS[decisions[movie.id]];
              const g=GENRE_COLORS[movie.genre]||GENRE_COLORS.Drama;
              return (
                <div key={movie.id} style={{background:"#0e0e0e",border:"1px solid #161616",borderRadius:11,padding:"9px 11px",display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:34,height:34,borderRadius:7,flexShrink:0,background:`linear-gradient(${g.grad})`,border:`1px solid ${g.accent}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{cat.emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,color:"#bbb",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                      {movie.title}{movie.id?.startsWith("ai-")&&<span style={{fontSize:8,color:"#4f46e5",verticalAlign:"middle",marginLeft:4}}>✦</span>}
                    </div>
                    <div style={{fontSize:9.5,color:"#555",marginTop:1}}>{movie.director} · {movie.year}</div>
                  </div>
                  <div style={{display:"flex",gap:2,flexShrink:0}}>
                    {Object.entries(CATS).filter(([k])=>k!==decisions[movie.id]).map(([k,c])=>(
                      <button key={k} onClick={()=>setDecisions(p=>({...p,[movie.id]:k}))} title={c.label} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,opacity:0.2,padding:2,transition:"opacity 0.15s"}}
                        onPointerEnter={e=>e.currentTarget.style.opacity=1}
                        onPointerLeave={e=>e.currentTarget.style.opacity=0.2}
                      >{c.emoji}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PERFIL ── */}
      {view === "profile" && profile && (
        <div style={{flex:1,width:"100%",padding:"8px 14px 24px",overflowY:"auto",display:"flex",flexDirection:"column",gap:10}}>
          {/* Cat summary */}
          <div style={{background:"#0e0e0e",border:"1px solid #161616",borderRadius:15,padding:"14px 16px"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:"#f0e6d0",marginBottom:12}}>Tu perfil cinematográfico</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:5,textAlign:"center"}}>
              {Object.entries(CATS).map(([k,c])=>(
                <div key={k} style={{background:"#111",borderRadius:9,padding:"9px 3px"}}>
                  <div style={{fontSize:19}}>{c.emoji}</div>
                  <div style={{fontSize:17,fontWeight:500,color:"#ccc",marginTop:2}}>{profile.catCount[k]||0}</div>
                  <div style={{fontSize:7.5,color:"#666",marginTop:1,lineHeight:1.3}}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top genres */}
          <div style={{background:"#0e0e0e",border:"1px solid #161616",borderRadius:15,padding:"14px 16px"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:"#f0e6d0",marginBottom:11}}>Géneros favoritos</div>
            {profile.topGenres.map(([genre,score])=>{
              const g=GENRE_COLORS[genre]||GENRE_COLORS.Drama;
              const max=profile.topGenres[0][1];
              return (
                <div key={genre} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,marginBottom:3}}>
                    <span style={{color:"#999"}}>{genre}</span>
                    <span style={{color:g.accent,fontSize:9}}>{score} pts</span>
                  </div>
                  <div style={{height:2.5,background:"#181818",borderRadius:2}}>
                    <div style={{height:"100%",borderRadius:2,width:`${(score/max)*100}%`,background:g.accent,opacity:0.65,transition:"width 0.5s"}} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top directors */}
          <div style={{background:"#0e0e0e",border:"1px solid #161616",borderRadius:15,padding:"14px 16px"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:"#f0e6d0",marginBottom:11}}>Directores afines</div>
            {profile.topDirs.map(([dir,score],i)=>(
              <div key={dir} style={{display:"flex",alignItems:"center",gap:9,marginBottom:7}}>
                <div style={{width:18,fontSize:10,color:"#555",textAlign:"right",flexShrink:0}}>#{i+1}</div>
                <div style={{flex:1,fontSize:11.5,color:"#aaa"}}>{dir}</div>
                <div style={{fontSize:12}}>{"❤️".repeat(Math.min(3,Math.round(score/2)))}</div>
              </div>
            ))}
          </div>

          {/* AI button */}
          <button onClick={loadMore} disabled={loadingAI} style={{background:loadingAI?"#0e0e0e":"#111",border:"1px solid #1a1a1a",color:loadingAI?"#222":"#c8b88a",borderRadius:13,padding:"13px",fontSize:12.5,cursor:loadingAI?"default":"pointer",fontWeight:500,width:"100%"}}>
            {loadingAI?"Generando recomendaciones personalizadas…":"✦ Pedir 15 recomendaciones con IA"}
          </button>
          {extraMovies.length>0&&<div style={{fontSize:9.5,color:"#555",textAlign:"center"}}>{extraMovies.length} películas cargadas por IA</div>}
        </div>
      )}

      {/* ERROR TOAST */}
      {aiError && (
        <div style={{
          position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
          background:"#1a0505", border:"1px solid #ef444440", color:"#ef4444",
          borderRadius:12, padding:"11px 20px", fontSize:12, zIndex:200,
          maxWidth:320, textAlign:"center", boxShadow:"0 4px 24px rgba(0,0,0,0.85)",
          pointerEvents:"none", lineHeight:1.5,
        }}>
          {aiError}
        </div>
      )}
    </div>
  );
}
