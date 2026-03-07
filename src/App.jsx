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
  // Lars von Trier
  { id:"lt1", title:"Melancholia",                       year:2011, genre:"Sci-Fi",   director:"Lars von Trier",         pitch:"Un planeta se acerca a la Tierra el día de una boda. El apocalipsis más hermoso jamás filmado." },
  { id:"lt2", title:"Dancer in the Dark",                year:2000, genre:"Drama",    director:"Lars von Trier",         pitch:"Una inmigrante ciega que vive en los musicales de su mente. Björk. Demoledora." },
  // David Cronenberg
  { id:"cr1", title:"Videodrome",                        year:1983, genre:"Sci-Fi",   director:"David Cronenberg",       pitch:"Un ejecutivo de TV recibe señales que disuelven la realidad. El cuerpo como tecnología. Cronenberg total." },
  { id:"cr2", title:"A History of Violence",             year:2005, genre:"Thriller", director:"David Cronenberg",       pitch:"Un hombre tranquilo en un pueblo pequeño tiene un pasado que no suelta. Viggo Mortensen inesperado." },
  { id:"cr3", title:"Eastern Promises",                  year:2007, genre:"Thriller", director:"David Cronenberg",       pitch:"Un médico descubre la conexión de un bebé con la mafia rusa en Londres. Viggo Mortensen brutal." },
  // Sidney Lumet
  { id:"sl1", title:"Network",                           year:1976, genre:"Thriller", director:"Sidney Lumet",           pitch:"Un ancla de noticias que enloquece en vivo. La más profética sobre los medios jamás hecha." },
  { id:"sl2", title:"12 Angry Men",                      year:1957, genre:"Drama",    director:"Sidney Lumet",           pitch:"Doce jurados deciden si un chico es culpable. Todo en un cuarto. Teatro hecho película perfecta." },
  { id:"sl3", title:"Dog Day Afternoon",                 year:1975, genre:"Thriller", director:"Sidney Lumet",           pitch:"Un asalto bancario que sale muy mal. Al Pacino. El caos como condición humana." },
  // Jean-Pierre Melville
  { id:"jm1", title:"Le Samourai",                       year:1967, genre:"Thriller", director:"Jean-Pierre Melville",   pitch:"Un asesino a sueldo en París con una rutina perfecta. El origen del thriller moderno europeo." },
  { id:"jm2", title:"Le Cercle Rouge",                   year:1970, genre:"Thriller", director:"Jean-Pierre Melville",   pitch:"Un ladrón, un fugitivo y un ex-policía planean un robo imposible. Tensión sin palabras." },
  // Werner Herzog
  { id:"wh1", title:"Aguirre, the Wrath of God",         year:1972, genre:"Drama",    director:"Werner Herzog",          pitch:"Conquistadores bajando el Amazonas y un loco que cree ser el elegido. Klaus Kinski desatado." },
  { id:"wh2", title:"Fitzcarraldo",                      year:1982, genre:"Drama",    director:"Werner Herzog",          pitch:"Un hombre obsesionado con llevar ópera a la selva. Literalmente movieron un barco por una montaña." },
  // Pedro Almodóvar
  { id:"pa1", title:"The Skin I Live In",                year:2011, genre:"Thriller", director:"Pedro Almodóvar",        pitch:"Un cirujano plástico y su experimento secreto. Hitchcock visto desde España. Perturbadora." },
  { id:"pa2", title:"Talk to Her",                       year:2002, genre:"Drama",    director:"Pedro Almodóvar",        pitch:"Dos hombres cuidan a mujeres en coma. Sobre el amor, la obsesión y los límites. Oscar al guión." },
  // Satoshi Kon
  { id:"sk1", title:"Perfect Blue",                      year:1997, genre:"Thriller", director:"Satoshi Kon",            pitch:"Una idol pop se convierte en actriz. Realidad y fantasía se disuelven. Influenció a Aronofsky directamente." },
  { id:"sk2", title:"Paprika",                           year:2006, genre:"Sci-Fi",   director:"Satoshi Kon",            pitch:"Una terapeuta puede entrar en los sueños ajenos. La inspiración de Inception, sin duda." },
  { id:"sk3", title:"Millennium Actress",                year:2001, genre:"Mystery",  director:"Satoshi Kon",            pitch:"La vida de una actriz contada siguiéndola por sus propias películas. Única en el cine mundial." },
  // Mamoru Oshii
  { id:"mo1", title:"Ghost in the Shell",                year:1995, genre:"Sci-Fi",   director:"Mamoru Oshii",           pitch:"Un cyborg policía caza a un hacker fantasma. La base filosófica de Matrix. Anime esencial." },
  // Kim Jee-woon
  { id:"kj1", title:"I Saw the Devil",                   year:2010, genre:"Thriller", director:"Kim Jee-woon",           pitch:"Un agente persigue al asesino de su novia sin capturarlo. El thriller de venganza más brutal del cine coreano." },
  { id:"kj2", title:"A Bittersweet Life",                year:2005, genre:"Thriller", director:"Kim Jee-woon",           pitch:"Un mafioso ejecuta mal una orden y paga las consecuencias. Elegante, estilizada y brutal." },
  // Na Hong-jin
  { id:"nh1", title:"The Wailing",                       year:2016, genre:"Horror",   director:"Na Hong-jin",            pitch:"Un policía investiga muertes extrañas en su pueblo y su hija es la siguiente. Aterradora y ambigua." },
  { id:"nh2", title:"The Chaser",                        year:2008, genre:"Thriller", director:"Na Hong-jin",            pitch:"Un ex-policía busca a una chica antes de que el asesino la mate. Frenética y sin respiro." },
  // Charlie Kaufman (continued)
  { id:"ck3", title:"I'm Thinking of Ending Things",     year:2020, genre:"Mystery",  director:"Charlie Kaufman",        pitch:"Una pareja en road trip a casa de los padres. La realidad se deshace capa a capa. Netflix." },
  // Céline Sciamma
  { id:"cs1", title:"Portrait of a Lady on Fire",        year:2019, genre:"Drama",    director:"Céline Sciamma",         pitch:"Una pintora y su modelo en la Bretaña del siglo XVIII. El romance más ardiente del cine reciente." },
  // Joachim Trier
  { id:"jt1", title:"The Worst Person in the World",     year:2021, genre:"Drama",    director:"Joachim Trier",          pitch:"Una mujer en sus 30s redefiniendo qué quiere de la vida. Noruega, viva y honesta como pocas." },
  { id:"jt2", title:"Thelma",                            year:2017, genre:"Sci-Fi",   director:"Joachim Trier",          pitch:"Una estudiante noruega descubre poderes inexplicables. Thriller sobrenatural y psicológico." },
  // Steve McQueen
  { id:"sm1", title:"Shame",                             year:2011, genre:"Drama",    director:"Steve McQueen",          pitch:"Un hombre adicto al sexo en Nueva York y su hermana que aparece. Fassbender. Incómoda e importante." },
  { id:"sm2", title:"12 Years a Slave",                  year:2013, genre:"Drama",    director:"Steve McQueen",          pitch:"Un hombre libre es secuestrado y vendido como esclavo. La más importante y difícil de ver." },
  // Paul Verhoeven
  { id:"pv1", title:"Starship Troopers",                 year:1997, genre:"Sci-Fi",   director:"Paul Verhoeven",         pitch:"Sátira del fascismo disfrazada de sci-fi de acción sobre soldados vs. insectos gigantes. Brillante." },
  { id:"pv2", title:"Total Recall",                      year:1990, genre:"Sci-Fi",   director:"Paul Verhoeven",         pitch:"¿Sus recuerdos son reales? Arnold Schwarzenegger y Philip K. Dick. Más inteligente de lo que parece." },
  // Jeremy Saulnier
  { id:"js1", title:"Green Room",                        year:2015, genre:"Thriller", director:"Jeremy Saulnier",        pitch:"Una banda punk queda atrapada tras presenciar algo en un bar neonazi. Brutal y sin respiro." },
  { id:"js2", title:"Blue Ruin",                         year:2013, genre:"Thriller", director:"Jeremy Saulnier",        pitch:"Un vagabundo decide vengarse del asesino de sus padres sin saber cómo. Tensa y muy humana." },
  // Yeon Sang-ho
  { id:"ys1", title:"Train to Busan",                    year:2016, genre:"Horror",   director:"Yeon Sang-ho",           pitch:"Apocalipsis zombie en un tren de Seúl a Busan. La mejor película de zombies en décadas." },
  // William Friedkin
  { id:"wf1", title:"Sorcerer",                          year:1977, genre:"Thriller", director:"William Friedkin",       pitch:"Cuatro criminales transportan nitroglicerina por la selva. Maestra olvidada del director de El Exorcista." },
  { id:"wf2", title:"To Live and Die in L.A.",           year:1985, genre:"Thriller", director:"William Friedkin",       pitch:"Agente federal persigue a un falsificador en Los Ángeles. El mejor thriller de los 80s que no viste." },
  // Kathryn Bigelow
  { id:"kb1", title:"Zero Dark Thirty",                  year:2012, genre:"Thriller", director:"Kathryn Bigelow",        pitch:"La caza de Bin Laden desde adentro. Larga, precisa, fría. La mejor película sobre el mundo post-9/11." },
  { id:"kb2", title:"The Hurt Locker",                   year:2008, genre:"Drama",    director:"Kathryn Bigelow",        pitch:"Una unidad de artificieros en Irak. Tensión sin música manipuladora. Oscar mejor película." },
  // Makoto Shinkai
  { id:"msh", title:"Your Name",                         year:2016, genre:"Sci-Fi",   director:"Makoto Shinkai",         pitch:"Dos jóvenes en ciudades distintas que se intercambian de cuerpo mientras duermen. Anime perfecto." },
  // Andrzej Żuławski
  { id:"az1", title:"Possession",                        year:1981, genre:"Horror",   director:"Andrzej Żuławski",       pitch:"Una pareja en Berlín occidental se separa bajo circunstancias cada vez más extrañas. La más perturbadora del cine europeo." },
  // Tony Gilroy
  { id:"tg1", title:"Michael Clayton",                   year:2007, genre:"Thriller", director:"Tony Gilroy",            pitch:"Un abogado especialista en tapar problemas descubre uno que no puede tapar. El thriller más elegante de los 2000s." },
  // Francis Ford Coppola
  { id:"fc1", title:"Apocalypse Now",                    year:1979, genre:"Drama",    director:"Francis Ford Coppola",   pitch:"Un soldado debe eliminar a un coronel que se volvió dios en la selva. El corazón de las tinieblas en Vietnam." },

  // ── COMEDIAS ──────────────────────────────────────────────────────────────
  // Billy Wilder
  { id:"co01", title:"Some Like It Hot",                 year:1959, genre:"Comedia",  director:"Billy Wilder",           pitch:"Dos músicos se disfrazan de mujeres para escapar de la mafia. Marilyn Monroe. La comedia perfecta según todo el mundo." },
  { id:"co02", title:"The Apartment",                    year:1960, genre:"Comedia",  director:"Billy Wilder",           pitch:"Un empleado presta su depa a sus jefes para sus aventuras. Wilder combinando comedia y corazón como nadie." },
  // Woody Allen
  { id:"co03", title:"Annie Hall",                       year:1977, genre:"Comedia",  director:"Woody Allen",            pitch:"Una pareja de intelectuales neoyorquinos se enamora y se separa. Redefinió la comedia romántica para siempre." },
  { id:"co04", title:"Manhattan",                        year:1979, genre:"Comedia",  director:"Woody Allen",            pitch:"Un escritor y sus complicaciones amorosas en Nueva York. Woody Allen enamorado de su ciudad. Blanco y negro perfecto." },
  { id:"co05", title:"Crimes and Misdemeanors",          year:1989, genre:"Comedia",  director:"Woody Allen",            pitch:"Un hombre exitoso considera asesinar a su amante. Comedia oscura sobre la moral, la impunidad y Dios. Mejor Woody Allen." },
  // Mel Brooks
  { id:"co06", title:"Blazing Saddles",                  year:1974, genre:"Comedia",  director:"Mel Brooks",             pitch:"Un sheriff negro en un pueblo del salvaje oeste lleno de racistas. Mel Brooks destruyendo el western con humor absoluto." },
  { id:"co07", title:"Young Frankenstein",               year:1974, genre:"Comedia",  director:"Mel Brooks",             pitch:"Parodia perfecta del clásico de terror. Gene Wilder y Mel Brooks en su mejor forma. Blanco y negro, homenaje y burla." },
  // Coen Brothers (comedia)
  { id:"co08", title:"The Big Lebowski",                 year:1998, genre:"Comedia",  director:"Coen Brothers",          pitch:"Un hombre equivocado, una alfombra robada y los Coen en modo absurdo total. El Dude abides. Culto máximo." },
  { id:"co09", title:"Burn After Reading",               year:2008, genre:"Comedia",  director:"Coen Brothers",          pitch:"Espías de la CIA y ciudadanos ordinarios terriblemente incompetentes. Los Coen en modo comedia negra afilada." },
  // Edgar Wright
  { id:"co10", title:"Shaun of the Dead",                year:2004, genre:"Comedia",  director:"Edgar Wright",           pitch:"Un chico sin rumbo enfrenta un apocalipsis zombie en su barrio londinense. La mejor comedia de horror jamás hecha." },
  { id:"co11", title:"Hot Fuzz",                         year:2007, genre:"Comedia",  director:"Edgar Wright",           pitch:"Un superpolicía enviado a un pueblo tranquilo que esconde algo. Acción, misterio y humor de otro nivel." },
  { id:"co12", title:"The World's End",                  year:2013, genre:"Comedia",  director:"Edgar Wright",           pitch:"Cinco amigos intentan repetir una legendaria pub crawl de su juventud. El final de la trilogía Cornetto. Inesperadamente emotiva." },
  // Taika Waititi
  { id:"co13", title:"What We Do in the Shadows",        year:2014, genre:"Comedia",  director:"Taika Waititi",          pitch:"Mockumentary sobre vampiros con roommates en Wellington, Nueva Zelanda. Humor absurdo perfecto. Taika Waititi puro." },
  { id:"co14", title:"Hunt for the Wilderpeople",        year:2016, genre:"Comedia",  director:"Taika Waititi",          pitch:"Un niño en adopción y su tutor gruñón huyen hacia el bush de Nueva Zelanda. Humor, corazón y aventura." },
  { id:"co15", title:"Jojo Rabbit",                      year:2019, genre:"Comedia",  director:"Taika Waititi",          pitch:"Un niño nazi tiene a Hitler imaginario como amigo del alma. Sátira sobre el fanatismo que termina siendo una carta de amor." },
  // Ruben Östlund
  { id:"co16", title:"Force Majeure",                    year:2014, genre:"Comedia",  director:"Ruben Östlund",          pitch:"Un padre huye de una avalancha abandonando a su familia. Cinco días de consecuencias incómodas. Suecia, invierno, humor cruel." },
  { id:"co17", title:"Triangle of Sadness",              year:2022, genre:"Comedia",  director:"Ruben Östlund",          pitch:"Un yate de millonarios naufraga. Lo que pasa después es una clase magistral de sátira de clases. Palme d'Or." },
  { id:"co18", title:"The Square",                       year:2017, genre:"Comedia",  director:"Ruben Östlund",          pitch:"Un curador de arte moderno enfrenta una crisis moral y de relaciones públicas. Östlund apuntando a la hipocresía ilustrada." },
  // Armando Iannucci
  { id:"co19", title:"In the Loop",                      year:2009, genre:"Comedia",  director:"Armando Iannucci",       pitch:"La guerra de Irak vista desde los pasillos del gobierno británico y americano. Política e incompetencia como comedia brutal." },
  { id:"co20", title:"The Death of Stalin",              year:2017, genre:"Comedia",  director:"Armando Iannucci",       pitch:"Los días después de la muerte de Stalin entre sus colaboradores aterrorizados. Comedia negra histórica brillante." },
  // Mike Judge
  { id:"co21", title:"Office Space",                     year:1999, genre:"Comedia",  director:"Mike Judge",             pitch:"Un programador odia su trabajo corporativo y decide simplemente no hacer nada. El Office avant la lettre. Perfecta." },
  { id:"co22", title:"Idiocracy",                        year:2006, genre:"Comedia",  director:"Mike Judge",             pitch:"Un hombre promedio despierta 500 años en el futuro y es el más inteligente de todos. Profética y aterradora." },
  // Christopher Guest / Rob Reiner
  { id:"co23", title:"Best in Show",                     year:2000, genre:"Comedia",  director:"Christopher Guest",      pitch:"Competencia de perros en Estados Unidos. Mockumentary sobre la locura de sus dueños. Christopher Guest en su mejor forma." },
  { id:"co24", title:"This Is Spinal Tap",               year:1984, genre:"Comedia",  director:"Rob Reiner",             pitch:"El documental falso de una banda de rock pesado en decadencia. El mockumentary que creó el género. Once to eleven." },
  // Harold Ramis
  { id:"co25", title:"Groundhog Day",                    year:1993, genre:"Comedia",  director:"Harold Ramis",           pitch:"Un meteorólogo revive el mismo día una y otra vez en un pueblo de Pennsylvania. Bill Murray. La más filosófica de las comedias." },
  // Alexander Payne
  { id:"co26", title:"Election",                         year:1999, genre:"Comedia",  director:"Alexander Payne",        pitch:"Una estudiante ambiciosa vs. un maestro frustrado en las elecciones del colegio. Reese Witherspoon afilada. Oscura y divertida." },
  { id:"co27", title:"Sideways",                         year:2004, genre:"Comedia",  director:"Alexander Payne",        pitch:"Dos amigos en un road trip vinícola por California. El fracaso, la amistad y el vino. Payne más amargo que nunca." },
  // Adam McKay
  { id:"co28", title:"The Big Short",                    year:2015, genre:"Comedia",  director:"Adam McKay",             pitch:"La crisis financiera de 2008 explicada con humor negro y cuarta pared. Más entretenida de lo que tiene derecho a ser." },
  { id:"co29", title:"Don't Look Up",                    year:2021, genre:"Comedia",  director:"Adam McKay",             pitch:"Dos astrónomos descubren un cometa mortal y nadie les cree. Sátira del negacionismo científico y los medios. Incómoda." },
  // Sacha Baron Cohen
  { id:"co30", title:"Borat",                            year:2006, genre:"Comedia",  director:"Larry Charles",          pitch:"Un periodista kazakho recorre Estados Unidos. Cohen sacando lo peor de la gente real haciéndolos actuar sin saberlo. Brutal." },
  // Rob Reiner
  { id:"co31", title:"When Harry Met Sally",             year:1989, genre:"Comedia",  director:"Rob Reiner",             pitch:"¿Pueden ser amigos un hombre y una mujer? Nora Ephron, Billy Crystal y Meg Ryan. La comedia romántica adulta definitiva." },
  // Monty Python
  { id:"co32", title:"Monty Python and the Holy Grail",  year:1975, genre:"Comedia",  director:"Terry Gilliam",          pitch:"El Rey Arturo busca el Santo Grial. El humor absurdo british más influyente de la historia. Caballos de coco incluidos." },
  { id:"co33", title:"Life of Brian",                    year:1979, genre:"Comedia",  director:"Terry Jones",            pitch:"Un hombre confundido con Jesús. Monty Python atacando la religión organizada sin miedo. La más valiente y más divertida." },
  // Jacques Tati
  { id:"co34", title:"Playtime",                         year:1967, genre:"Comedia",  director:"Jacques Tati",           pitch:"París rediseñada como laberinto de vidrio y acero. Tati sin diálogos, solo gags visuales perfectos. Cine puro sin igual." },
  // Luis Buñuel
  { id:"co35", title:"The Discreet Charm of the Bourgeoisie", year:1972, genre:"Comedia", director:"Luis Buñuel",        pitch:"Seis burgueses intentan cenar juntos pero algo siempre lo impide. Buñuel burlándose de su propia clase. Surreal y precisa." },
  // Charlie Chaplin
  { id:"co36", title:"The Great Dictator",               year:1940, genre:"Comedia",  director:"Charlie Chaplin",        pitch:"Chaplin parodiando a Hitler en plena guerra. El discurso final es de los más emocionantes en la historia del cine." },
  { id:"co37", title:"Modern Times",                     year:1936, genre:"Comedia",  director:"Charlie Chaplin",        pitch:"Chaplin como obrero en la era industrial. Gags perfectos, crítica social y una de las mejores actuaciones de la historia." },
  // Preston Sturges
  { id:"co38", title:"Sullivan's Travels",               year:1941, genre:"Comedia",  director:"Preston Sturges",        pitch:"Un director de Hollywood quiere hacer cine serio y aprende que la comedia puede salvar vidas. Meta y hermosa." },
  // Jason Reitman
  { id:"co39", title:"Thank You for Smoking",            year:2005, genre:"Comedia",  director:"Jason Reitman",          pitch:"Un lobbysta del tabaco navega su trabajo sin ética con total encanto. Sátira americana afilada y muy divertida." },
  { id:"co40", title:"Juno",                             year:2007, genre:"Comedia",  director:"Jason Reitman",          pitch:"Una adolescente queda embarazada y decide darlo en adopción. Diálogos perfectos, humor seco, corazón enorme." },
  { id:"co41", title:"Up in the Air",                    year:2009, genre:"Comedia",  director:"Jason Reitman",          pitch:"Un hombre que vive en aviones despidiendo gente enfrenta su propia crisis existencial. Clooney en su mejor papel." },
  // David O. Russell
  { id:"co42", title:"Silver Linings Playbook",          year:2012, genre:"Comedia",  director:"David O. Russell",       pitch:"Un hombre bipolar sale del psiquiátrico y conoce a una mujer igual de rota. Jennifer Lawrence y Bradley Cooper inesperados." },
  // Todd Phillips / Greg Mottola / Judd Apatow
  { id:"co43", title:"The Hangover",                     year:2009, genre:"Comedia",  director:"Todd Phillips",          pitch:"Tres amigos despiertan en Las Vegas sin recuerdo de la noche anterior y con un tigre en el cuarto. Comedia de situación perfecta." },
  { id:"co44", title:"Superbad",                         year:2007, genre:"Comedia",  director:"Greg Mottola",           pitch:"Dos amigos intentan conseguir alcohol para una fiesta en su última noche del bachillerato. La mejor comedia adolescente del siglo." },
  { id:"co45", title:"The 40-Year-Old Virgin",           year:2005, genre:"Comedia",  director:"Judd Apatow",            pitch:"Un hombre de 40 años que nunca ha tenido sexo y sus amigos decididos a cambiar eso. Steve Carell. Más ternura que vergüenza." },
  // Yorgos Lanthimos (comedia oscura)
  { id:"co46", title:"Dogtooth",                         year:2009, genre:"Comedia",  director:"Yorgos Lanthimos",       pitch:"Tres adultos criados en casa por padres que les mienten sobre el mundo. Lanthimos antes de ser Lanthimos. Perturbadora y única." },
  // Clásicos británicos
  { id:"co47", title:"A Fish Called Wanda",              year:1988, genre:"Comedia",  director:"Charles Crichton",       pitch:"Cuatro ladrones se traicionan mutuamente. John Cleese, Kevin Kline y Jamie Lee Curtis. El humor inglés-americano perfecto." },
  { id:"co48", title:"Withnail and I",                   year:1987, genre:"Comedia",  director:"Bruce Robinson",         pitch:"Dos actores desempleados y borrachos en el Londres de los 60s. Culto total. La más amarga y hermosa de las comedias británicas." },
  { id:"co49", title:"Four Weddings and a Funeral",      year:1994, genre:"Comedia",  director:"Mike Newell",            pitch:"Un inglés torpe asiste a cuatro bodas enamorándose en cada una. Hugh Grant en su papel definitivo. Richard Curtis en su cima." },
  // Jean-Pierre Jeunet
  { id:"co50", title:"Amélie",                           year:2001, genre:"Comedia",  director:"Jean-Pierre Jeunet",     pitch:"Una chica tímida en París decide mejorar la vida de los que la rodean. La película francesa más vista del mundo. Irresistible." },

  // ── HORROR SOBRENATURAL ───────────────────────────────────────────────────
  // James Wan
  { id:"hr01", title:"The Conjuring",                    year:2013, genre:"Horror",   director:"James Wan",              pitch:"Los investigadores del paranormal Ed y Lorraine Warren en su caso más aterrador. El mejor horror sobrenatural de los 2010s." },
  { id:"hr02", title:"The Conjuring 2",                  year:2016, genre:"Horror",   director:"James Wan",              pitch:"Los Warren en Enfield, el poltergeist más famoso de Europa. Wan mejorando la fórmula de la primera. La monja, el valack." },
  { id:"hr03", title:"Insidious",                        year:2010, genre:"Horror",   director:"James Wan",              pitch:"Una familia cuyo hijo cae en coma y empieza lo que no querías ver. El horror sobrenatural de los 2010s en estado puro." },
  { id:"hr04", title:"Insidious: Chapter 2",             year:2013, genre:"Horror",   director:"James Wan",              pitch:"La historia continúa sin pausa desde donde terminó la primera. El misterio del Further se expande de forma inesperada." },
  // Clásicos del horror
  { id:"hr05", title:"The Exorcist",                     year:1973, genre:"Horror",   director:"William Friedkin",       pitch:"Una niña poseída por el diablo y dos sacerdotes al límite. La más aterradora de la historia. Prohibida en varios países en su época." },
  { id:"hr06", title:"Rosemary's Baby",                  year:1968, genre:"Horror",   director:"Roman Polanski",         pitch:"Una mujer embarazada sospecha que sus vecinos y su esposo planean algo con su bebé. Polanski creando el horror psicológico total." },
  { id:"hr07", title:"The Omen",                         year:1976, genre:"Horror",   director:"Richard Donner",         pitch:"Un diplomático descubre que su hijo adoptivo puede ser el Anticristo. El terror religioso más efectivo de los años 70s." },
  { id:"hr08", title:"Poltergeist",                      year:1982, genre:"Horror",   director:"Tobe Hooper",            pitch:"Una familia suburbana es aterrorizada por espíritus que raptan a su hija. El horror doméstico de Spielberg/Hooper. Clásico absoluto." },
  // John Carpenter
  { id:"hr09", title:"The Thing",                        year:1982, genre:"Horror",   director:"John Carpenter",         pitch:"Una criatura alienígena en la Antártida que puede imitar a cualquier ser vivo. Carpenter en su cima. El suspenso más claustrofóbico." },
  { id:"hr10", title:"Halloween",                        year:1978, genre:"Horror",   director:"John Carpenter",         pitch:"Un asesino escapa el día de Halloween y vuelve a su pueblo. La película que creó el slasher moderno. Cero presupuesto, terror total." },
  // Wes Craven
  { id:"hr11", title:"A Nightmare on Elm Street",        year:1984, genre:"Horror",   director:"Wes Craven",             pitch:"Un asesino quemado que ataca en tus sueños. Craven inventando a Freddy Krueger. El horror más original de los 80s." },
  { id:"hr12", title:"Scream",                           year:1996, genre:"Horror",   director:"Wes Craven",             pitch:"Un asesino llama a sus víctimas antes de atacarlas. Deconstrucción y celebración del slasher al mismo tiempo. Inteligente." },
  // Scott Derrickson
  { id:"hr13", title:"Sinister",                         year:2012, genre:"Horror",   director:"Scott Derrickson",       pitch:"Un escritor de true crime encuentra películas snuff en su nuevo ático. La más aterradora de los 2010s según estudios científicos." },
  { id:"hr14", title:"The Black Phone",                  year:2022, genre:"Horror",   director:"Scott Derrickson",       pitch:"Un niño secuestrado recibe llamadas de las víctimas anteriores del asesino desde un teléfono desconectado. Ethan Hawke perturbador." },
  // Mike Flanagan
  { id:"hr15", title:"Oculus",                           year:2013, genre:"Horror",   director:"Mike Flanagan",          pitch:"Un espejo antiguo que distorsiona la realidad de quienes lo rodean. Flanagan jugando con el tiempo y la percepción. Inteligente." },
  { id:"hr16", title:"Doctor Sleep",                     year:2019, genre:"Horror",   director:"Mike Flanagan",          pitch:"Danny Torrance adulto debe proteger a una niña con el don del resplandor. La secuela de El Resplandor que no esperabas." },
  // Jennifer Kent
  { id:"hr17", title:"The Babadook",                     year:2014, genre:"Horror",   director:"Jennifer Kent",          pitch:"Una madre viuda y su hijo aterrorizado por un monstruo de un libro. La metáfora del duelo más aterradora del cine reciente." },
  // David Robert Mitchell
  { id:"hr18", title:"It Follows",                       year:2014, genre:"Horror",   director:"David Robert Mitchell",  pitch:"Una entidad que camina hacia ti sin parar, transmitida sexualmente. El horror adolescente más inteligente y perturbador de los 2010s." },
  // John Krasinski
  { id:"hr19", title:"A Quiet Place",                    year:2018, genre:"Horror",   director:"John Krasinski",         pitch:"Una familia sobrevive en un mundo donde los monstruos cazan por sonido. Tensión sin música, silencio como arma. Perfecta." },
  { id:"hr20", title:"A Quiet Place Part II",            year:2021, genre:"Horror",   director:"John Krasinski",         pitch:"La familia Abbot explora un mundo más amplio y más peligroso. Krasinski sabiendo expandir el mito sin perder la tensión." },
  // Alejandro Amenábar
  { id:"hr21", title:"The Others",                       year:2001, genre:"Horror",   director:"Alejandro Amenábar",     pitch:"Una mujer en una mansión brumosa protege a sus hijos fotosensibles y algo más vive con ellos. El giro que no ves venir." },
  // Tomas Alfredson
  { id:"hr22", title:"Let the Right One In",             year:2008, genre:"Horror",   director:"Tomas Alfredson",        pitch:"Un niño solitario se hace amigo de una vampira que lleva siglos con 12 años. Suecia, nieve, amor y horror. Hermosa y perturbadora." },
  // Guillermo del Toro
  { id:"hr23", title:"The Devil's Backbone",             year:2001, genre:"Horror",   director:"Guillermo del Toro",     pitch:"Un niño en un orfanato de la guerra civil española con el fantasma de un compañero muerto. Del Toro antes de El laberinto del fauno." },
  // Dario Argento
  { id:"hr24", title:"Suspiria",                         year:1977, genre:"Horror",   director:"Dario Argento",          pitch:"Una bailarina llega a una academia de danza alemana que esconde algo muy oscuro. Argento en su cima. Color, música y terror puro." },
  // Sam Raimi
  { id:"hr25", title:"Drag Me to Hell",                  year:2009, genre:"Horror",   director:"Sam Raimi",              pitch:"Una empleada de banco rechaza un préstamo a una anciana y es maldita. Raimi volviendo al horror con energía y humor negro." },
  { id:"hr26", title:"Evil Dead II",                     year:1987, genre:"Horror",   director:"Sam Raimi",              pitch:"El clásico de horror-comedia de Raimi. Bruce Campbell contra los demonios en una cabaña. El splatstick llevado al extremo absoluto." },
  // J-Horror
  { id:"hr27", title:"Ringu",                            year:1998, genre:"Horror",   director:"Hideo Nakata",           pitch:"Una periodista investiga una cinta de video que mata a quien la ve 7 días después. El original japonés que aterrorizó al mundo." },
  { id:"hr28", title:"Ju-On: The Grudge",                year:2002, genre:"Horror",   director:"Takashi Shimizu",        pitch:"Una maldición en una casa en Tokio que se expande a todos los que la visitan. El horror japonés más contagioso y perturbador." },
  { id:"hr29", title:"Audition",                         year:1999, genre:"Horror",   director:"Takashi Miike",          pitch:"Un viudo busca nueva pareja a través de una audición falsa. Todo va bien hasta que no. El giro más perturbador del J-horror." },
  { id:"hr30", title:"Kairo",                            year:2001, genre:"Horror",   director:"Kiyoshi Kurosawa",       pitch:"Los fantasmas de los muertos se filtran por internet. Kurosawa anticipando el horror de la desconexión digital. Profética y única." },
  { id:"hr31", title:"Cure",                             year:1997, genre:"Horror",   director:"Kiyoshi Kurosawa",       pitch:"Un detective investiga una serie de asesinatos sin motivo aparente. Kurosawa y el hipnotismo como horror existencial. Fría y única." },
  // Horror reciente
  { id:"hr32", title:"Lights Out",                       year:2016, genre:"Horror",   director:"David Sandberg",         pitch:"Una entidad que solo existe en la oscuridad persigue a una familia. La premisa más simple y más aterradora del horror reciente." },
  { id:"hr33", title:"Annabelle: Creation",              year:2017, genre:"Horror",   director:"David Sandberg",         pitch:"El origen de la muñeca más perturbadora del universo Conjuring. Sandberg creando atmósfera densa y terror real en cada cuarto." },
  { id:"hr34", title:"The Ritual",                       year:2017, genre:"Horror",   director:"David Bruckner",         pitch:"Cuatro amigos se pierden en un bosque escandinavo y algo los sigue. Lovecraft en el norte de Europa. Tensa y muy atmosférica." },
  { id:"hr35", title:"The Night House",                  year:2020, genre:"Horror",   director:"David Bruckner",         pitch:"Una viuda descubre que su marido suicida le escondía una vida paralela. Rebecca Hall sola vs. algo que no debería existir." },
  { id:"hr36", title:"Goodnight Mommy",                  year:2014, genre:"Horror",   director:"Severin Fiala",          pitch:"Dos gemelos sospechan que la mujer con la cara vendada no es su madre. Austria, soledad y horror que crece sin parar hasta el final." },
  // Brian De Palma / Stephen King
  { id:"hr37", title:"Carrie",                           year:1976, genre:"Horror",   director:"Brian De Palma",         pitch:"Una adolescente con poderes telequinéticos es humillada en su graduación. De Palma y Stephen King en su momento más brutal." },
  // 1408
  { id:"hr38", title:"1408",                             year:2007, genre:"Horror",   director:"Mikael Håfström",        pitch:"Un escritor escéptico pasa la noche en una habitación de hotel maldita. John Cusack solo vs. algo que no puedes ver. Más intensa de lo que esperas." },
  // Ti West
  { id:"hr39", title:"The House of the Devil",           year:2009, genre:"Horror",   director:"Ti West",                pitch:"Una estudiante cuida una casa en los 80s y algo está muy mal. Ti West reconstruyendo el horror de esa era desde adentro. Paciente y efectiva." },
  { id:"hr40", title:"The Innkeepers",                   year:2011, genre:"Horror",   director:"Ti West",                pitch:"Dos empleados de un hotel a punto de cerrar buscan fantasmas. Ti West, humor y terror que no sabes cuándo va a atacar." },
  // Clásicos del género
  { id:"hr41", title:"Nosferatu",                        year:1922, genre:"Horror",   director:"F.W. Murnau",            pitch:"El vampiro más antiguo del cine. Murnau sin los derechos de Drácula creando algo más oscuro y perturbador que el original." },
  { id:"hr42", title:"The Haunting",                     year:1963, genre:"Horror",   director:"Robert Wise",            pitch:"Un grupo investiga una mansión en New England. Robert Wise y el horror que nunca muestras. La más elegante de todas las de fantasmas." },
  { id:"hr43", title:"Diabolique",                       year:1955, genre:"Horror",   director:"Henri-Georges Clouzot",  pitch:"La esposa y la amante de un director de escuela lo matan y el cuerpo desaparece. El thriller de horror más sofisticado de los 50s." },
  // Kim Jee-woon
  { id:"hr44", title:"A Tale of Two Sisters",            year:2003, genre:"Horror",   director:"Kim Jee-woon",           pitch:"Dos hermanas regresan a casa de su padre y su nueva madrastra. Kim Jee-woon antes de los thrillers. El horror coreano en su absoluta cima." },
  // Andy Muschietti
  { id:"hr45", title:"It",                               year:2017, genre:"Horror",   director:"Andy Muschietti",        pitch:"Un grupo de niños en un pueblo de Maine aterrorizado por un payaso que aparece cada 27 años. Pennywise. El Stephen King más esperado." },
  // Horror moderno
  { id:"hr46", title:"The Invisible Man",                year:2020, genre:"Horror",   director:"Leigh Whannell",         pitch:"Una mujer escapa de su novio abusivo solo para ser perseguida por algo que no puede ver. El horror como metáfora del abuso. Elisabeth Moss." },
  { id:"hr47", title:"Smile",                            year:2022, genre:"Horror",   director:"Parker Finn",            pitch:"Una psicóloga empieza a ver sonrisas perturbadoras en todos después de presenciar un suicidio. La entidad que se transmite persona a persona." },
  { id:"hr48", title:"Barbarian",                        year:2022, genre:"Horror",   director:"Zach Cregger",           pitch:"Una mujer llega a su Airbnb y descubre que alguien más lo reservó. No googles nada más sobre esta película. Solo véla." },
  { id:"hr49", title:"M3GAN",                            year:2022, genre:"Horror",   director:"Gerard Johnstone",       pitch:"Una muñeca IA protege a su niña demasiado bien. Horror tecnológico con sentido del humor. El personaje más inesperado del género." },
  { id:"hr50", title:"Talk to Me",                       year:2022, genre:"Horror",   director:"Danny Philippou",        pitch:"Jóvenes descubren que enchufarse la mano embalsamada de un medium les permite ver muertos. El horror australiano más impactante en años." },
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
  const [copyStatus, setCopyStatus] = useState(null); // null | "copied"
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

    // Build a rich taste profile from all decisions
    const lovedMovies    = allMovies.filter(m => decisions[m.id] === "love");
    const likedMovies    = allMovies.filter(m => decisions[m.id] === "fine");
    const dislikedMovies = allMovies.filter(m => decisions[m.id] === "dislike" || decisions[m.id] === "skip");

    const genreScore = {}, genreDislike = {}, dirScore = {};
    [...lovedMovies.map(m=>({...m,w:2})), ...likedMovies.map(m=>({...m,w:1}))].forEach(({genre, director, w}) => {
      genreScore[genre]  = (genreScore[genre]  || 0) + w;
      dirScore[director] = (dirScore[director] || 0) + w;
    });
    dislikedMovies.forEach(({genre}) => { genreDislike[genre] = (genreDislike[genre] || 0) + 1; });

    const topGenres    = Object.entries(genreScore).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([g])=>g);
    const topDirs      = Object.entries(dirScore).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([d])=>d);
    const avoidGenres  = Object.entries(genreDislike)
      .filter(([g,n]) => n >= 2 && !(genreScore[g] > genreDislike[g]))
      .sort((a,b)=>b[1]-a[1]).slice(0,3).map(([g])=>g);

    const lovedYears  = lovedMovies.map(m => m.year);
    const avgYear     = lovedYears.length ? Math.round(lovedYears.reduce((a,b)=>a+b,0)/lovedYears.length) : 2000;

    const payload = {
      lovedTitles:    lovedMovies.slice(0,12).map(m => m.title),
      likedTitles:    likedMovies.slice(0,8).map(m => m.title),
      dislikedTitles: dislikedMovies.slice(0,6).map(m => m.title),
      topGenres,
      avoidGenres,
      topDirs,
      avgYear,
      existing: allMovies.map(m => m.title),
    };

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server responded ${res.status}`);
      const { movies } = data;
      setExtraMovies(prev => [...prev, ...movies.map((m, i) => ({ ...m, id: `ai-${Date.now()}-${i}`, genre: m.genre || "Drama" }))]);
    } catch (e) {
      console.error("AI load failed", e);
      setAiError(`Error: ${e.message}`);
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

  const buildClaudePrompt = () => {
    if (!decisions) return "";
    const loved    = allMovies.filter(m => decisions[m.id] === "love");
    const liked    = allMovies.filter(m => decisions[m.id] === "fine");
    const disliked = allMovies.filter(m => decisions[m.id] === "dislike" || decisions[m.id] === "skip");
    const genreScore = {}, genreDislike = {}, dirScore = {};
    [...loved.map(m=>({...m,w:2})), ...liked.map(m=>({...m,w:1}))].forEach(({genre,director,w}) => {
      genreScore[genre]  = (genreScore[genre]  || 0) + w;
      dirScore[director] = (dirScore[director] || 0) + w;
    });
    disliked.forEach(({genre}) => { genreDislike[genre] = (genreDislike[genre]||0)+1; });
    const topGenres   = Object.entries(genreScore).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([g])=>g);
    const topDirs     = Object.entries(dirScore).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([d])=>d);
    const avoidGenres = Object.entries(genreDislike).filter(([g,n])=>n>=2&&!(genreScore[g]>genreDislike[g])).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([g])=>g);
    const lovedYears  = loved.map(m=>m.year);
    const avgYear     = lovedYears.length ? Math.round(lovedYears.reduce((a,b)=>a+b,0)/lovedYears.length) : 2000;
    const existing    = allMovies.map(m=>m.title);

    return `Soy un cinéfilo y quiero recomendaciones personalizadas. Este es mi perfil exacto basado en ${loved.length + liked.length} películas valoradas:

GÉNEROS FAVORITOS (rankeados): ${topGenres.join(", ")}
DIRECTORES FAVORITOS (por afinidad): ${topDirs.join(", ")}
ERA PREFERIDA: filmes alrededor de ${avgYear} (promedio de mis películas amadas)
${avoidGenres.length ? `GÉNEROS QUE NO ME GUSTAN: ${avoidGenres.join(", ")}\n` : ""}
PELÍCULAS QUE AMÉ: ${loved.slice(0,14).map(m=>m.title).join(", ")}
PELÍCULAS QUE ME GUSTARON: ${liked.slice(0,10).map(m=>m.title).join(", ")}
${disliked.length ? `PELÍCULAS QUE NO ME GUSTARON: ${disliked.slice(0,6).map(m=>m.title).join(", ")}\n` : ""}
YA VÍ (no recomendar): ${existing.join(", ")}

Por favor recomiéndame 15 películas que no estén en la lista anterior. Para cada una dame: título, año, director, género, y en una sola frase en español explica por qué crees que ME VA A GUSTAR específicamente basándote en mi perfil.`;
  };

  const copyProfileForClaude = () => {
    const text = buildClaudePrompt();
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus(null), 2500);
    });
  };

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

          {/* Copiar perfil para Claude.ai */}
          <button onClick={copyProfileForClaude} style={{background: copyStatus ? "#0d2818" : "#0e0e0e", border:`1px solid ${copyStatus?"#4ade8040":"#1a1a1a"}`, color: copyStatus ? "#4ade80" : "#c8b88a", borderRadius:13, padding:"13px", fontSize:12.5, cursor:"pointer", fontWeight:500, width:"100%", transition:"all 0.2s"}}>
            {copyStatus ? "✓ ¡Copiado! Pégalo en claude.ai" : "📋 Copiar perfil para Claude.ai"}
          </button>
          <div style={{fontSize:10,color:"#444",textAlign:"center",lineHeight:1.5}}>
            Copia tu perfil → pégalo en <span style={{color:"#666"}}>claude.ai</span> con tu plan Pro → pide recomendaciones personalizadas
          </div>

          {/* AI button (si tienes API key) */}
          <button onClick={loadMore} disabled={loadingAI} style={{background:"#0a0a0a",border:"1px solid #141414",color:loadingAI?"#222":"#555",borderRadius:13,padding:"11px",fontSize:11,cursor:loadingAI?"default":"pointer",width:"100%"}}>
            {loadingAI?"Generando…":"✦ Cargar más con API (requiere créditos)"}
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
