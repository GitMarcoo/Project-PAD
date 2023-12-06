describe("All Stories", () => {
    const endpoint = "/stories?order=%22desc%22";
    const chunkSize = 10;

    //Run before each test in this context
    beforeEach(() => {
        // Mock the response from the server for the stories
        cy.server()
        cy.intercept("GET", endpoint,{
            statusCode: 200,
            body: mockedResponse
        }).as("stories");
    });




    it("Successfully loading stories", () => {
        cy.visit("http://localhost:8080/#allStories");
        cy.wait("@stories");
        // Wait for stories to have been loaded
        cy.get('#stories article').should('have.length', chunkSize);
    });


    it('Infinite Scrolling works', function () {
        cy.visit("http://localhost:8080/#allStories");
        cy.wait("@stories");
        // Wait for stories to have been loaded and then scroll to the bottom of the page
        cy.get('#stories article').should('have.length', chunkSize);
        cy.scrollTo("bottom");
        // Check that there are now more stories
        cy.get('#stories article').should('have.length', mockedResponse.length);
        cy.wait(2000);
        cy.scrollTo("bottom");
        cy.get('#allStoriesLoaded').should('be.visible');

    });

    it('Filtering new and old works', function () {
        cy.visit("http://localhost:8080/#allStories");
        cy.wait("@stories")
        // Wait for stories to have been loaded
        cy.get('#stories article').should('have.length', chunkSize);
        // Check that the stories are in the correct order from new to old
        checkNewOldStories(chunkSize-1);
        // Change the filter from old to new
        cy.get("#oldNew").click();
        // Wait for the stories to have been loaded
        cy.get('#stories article').should('have.length.at.least', chunkSize);
        // Check that the stories are in the correct order from old to new
        checkOldNewStories(chunkSize-1);
    });

    it('Filtering stays consistent with infinite scrolling', function () {
        cy.visit("http://localhost:8080/#allStories");
        cy.wait("@stories");
        // Wait for stories to have been loaded and then scroll to the bottom of the page
        cy.get('#stories article').should('have.length', chunkSize);
        cy.scrollTo("bottom");
        // Check that there are now more stories
        cy.get('#stories article').should('have.length', mockedResponse.length);
        cy.wait(2000);
        cy.scrollTo("bottom");
        // Check that the stories are in the correct order from new to old
        checkNewOldStories((mockedResponse.length - 2));
        // Change the filter from old to new
        cy.get("#oldNew").click();
        cy.get('#stories article').should('have.length', chunkSize);
        cy.scrollTo("bottom");
        // Check that there are now more stories
        cy.get('#stories article').should('have.length', mockedResponse.length);
        cy.wait(2000);
        cy.scrollTo("bottom");
        // Check that the stories are in the correct order from old to new
        checkOldNewStories(mockedResponse.length - 2);
    });


    it('Create Button works', function () {
        cy.visit("http://localhost:8080/#allStories");
        cy.wait("@stories");
        // Wait for stories to have been loaded
        cy.get('#stories article').should('have.length', chunkSize);
        // Check that the create button exists and click it
        cy.get("#createButton").should("exist");
        cy.get("#createButton").click();
        // Check that the url has changed to the create page
        cy.url().should("include", "#addStories")
    });


    it('Should open a story', function () {
        cy.visit("http://localhost:8080/#allStories");
        cy.wait("@stories");
        // Wait for stories to have been loaded
        cy.get('#stories article').should('have.length', chunkSize);
        // Click on the first story
        cy.get("#stories article").children().first().click();
        // Check that the url has changed to the full story page
        cy.url().should("include", "#fullStories");
    });




    it('Successful error handling when failed to get stories', function () {
        // Mock the response from the server for the stories but with a 400 error
        cy.intercept("GET", endpoint,{
            statusCode: 400,
        }).as("failed-stories");
        cy.visit("http://localhost:8080/#allStories");
        cy.wait("@failed-stories");
        // Check that the error message is shown
        cy.get(".wrong-input").should("exist").should("contain","Fout tijdens ophalen van verhalen" );
    });

    function formatDate(dateString) {
        const parts = dateString.split('-');
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${month}/${day}/${year}`;
    }

    function checkNewOldStories(lastindex){
        cy.get("#stories article").first().find('h6')// Select the first story
            .invoke('text') // Extract the text value
            .then((currentDate) => {
                cy.get("#stories article").eq(lastindex) // Traverse to the next element
                    .find('h6') // Find the next element
                    .invoke('text') // Extract the text value
                    .then((nextDate) => {
                        const currentTimestamp = new Date(formatDate(currentDate))
                        const nextTimestamp = new Date(formatDate(nextDate))
                        expect(currentTimestamp).be.at.least(nextTimestamp);
                    });
            });
    }

    function checkOldNewStories(lastindex){
        cy.get("#stories article").first().find('h6')// Select the first story
            .invoke('text') // Extract the text value
            .then((currentDate) => {
                cy.get("#stories article").eq(lastindex) // Traverse to the next element
                    .find('h6') // Find the next element
                    .invoke('text') // Extract the text value
                    .then((nextDate) => {
                        const currentTimestamp = new Date(formatDate(currentDate))
                        const nextTimestamp = new Date(formatDate(nextDate))
                        expect(nextTimestamp).be.at.least(currentTimestamp);
                    });
            });
    }


    const mockedResponse = [
        {
            "idStory": 98,
            "title": "Avontuur",
            "text": "Er was eens een jongen genaamd Max, die altijd al gefascineerd was geweest door de sterren en het heelal. Hij bracht vele nachten door met zijn telescoop en het bestuderen van de verschillende planeten en sterrenstelsels.\n\nOp een nacht, terwijl Max zijn telescoop aan het opzetten was, zag hij iets ongewoons. Het was een fel licht dat steeds groter leek te worden, en hij kon het gevoel niet van zich afzetten dat het iets heel bijzonders was.\n\nNaarmate het licht dichterbij kwam, begon Max zich zorgen te maken. Maar toen het eindelijk landde, ontdekte hij dat het een buitenaards schip was, dat was gestrand op aarde.\n\nMax was geschokt, maar ook opgewonden, want hij wist dat hij getuige was van een unieke gebeurtenis. Hij begon te praten met de bemanning van het schip, en ontdekte dat ze op zoek waren naar een nieuwe planeet om te koloniseren.\n\nMax, die altijd al gefascineerd was geweest door het idee van het ontdekken van nieuwe werelden, bood aan om hen te helpen. En zo begon een episch avontuur, waarin Max en de bemanning van het buitenaardse schip samenwerkten om een nieuwe thuis te vinden voor hun soort.",
            "date": "2023-03-28T12:19:14.000Z",
            "location": "de Flat",
            "image": "/uploads/2117.jpg"
        },
        {
            "idStory": 97,
            "title": "De Grootste Voetballegende uit de Regio van d",
            "text": "Er was eens een jongen genaamd Marco die opgroeide in een klein dorpje in de regio van de Florijn. Marco was altijd al dol op voetbal en bracht al zijn vrije tijd door op het lokale voetbalveld. Ondanks dat het team van zijn dorp niet zo goed was, was Marco vastbesloten om ooit een professionele voetballer te worden.\n\nToen Marco 16 jaar oud was, werd hij opgemerkt door een talentenscout van een grote voetbalclub in de regio. Marco was erg blij met deze kans en vertrok naar de stad om te trainen met het jeugdteam van de club. Al snel werd duidelijk dat Marco een natuurtalent was en hij maakte snel naam in de jeugdcompetities.\n\nNa enkele jaren bij de jeugd gespeeld te hebben, werd Marco opgenomen in het eerste team van de club. Hij speelde zo goed dat hij al snel de aandacht trok van andere clubs in de regio. Marco koos ervoor om bij zijn huidige club te blijven, omdat hij zich daar echt thuis voelde.\n\nMarco speelde zo goed in het eerste team dat hij al snel werd opgeroepen voor het nationale team van de Florijn. Hij was erg trots om zijn land te vertegenwoordigen en speelde zo goed dat hij al snel de aanvoerder van het team werd.\n\nMarco's succes op het voetbalveld ging niet onopgemerkt voorbij. Hij werd een beroemdheid in de regio van de Florijn en werd beschouwd als een van de beste voetballers van zijn generatie. Hij won vele prijzen en was geliefd bij de fans.\n\nMaar ondanks al zijn successen bleef Marco altijd nederig en dankbaar voor zijn kansen. Hij hielp vaak bij de ontwikkeling van jonge voetballers in de regio en gaf graag terug aan de gemeenschap die hem had geholpen om te komen waar hij was.\n\nOp een dag besloot Marco om zijn voetbalcarrière te beëindigen en met pensioen te gaan. Maar zijn legende leefde voort en hij werd beschouwd als een van de grootste voetballers die ooit uit de regio van de Florijn was voortgekomen. Zijn naam zou voor altijd in de geschiedenis van het voetbal blijven voortleven.",
            "date": "2023-03-28T11:36:16.000Z",
            "location": "Park Noord",
            "image": "../uploads/2892.jpg"
        }, {
            "idStory": 95,
            "title": "Animals",
            "text": "Rickie loved animals. He was bitten by a snake when he was little and it scared him but he loved animals so much. When Rickie turned 11, his parents took him to the zoo and Rickie fell in love with all of the animals. One day, Rickie saw a monkey in a cage and he wanted to get it out so he could play with it. His parents told him not to do that because the monkey might get hurt, but Rickie didn't listen. He climbed up the bars of the cage and got the monkey out. The monkey was terrified and ran offstage screaming, but Rickie wasn't even phased by that because he just enjoyed playing with animals!",
            "date": "2023-03-28T10:29:28.000Z",
            "location": "de Flat",
            "image": null
        }, {
            "idStory": 94,
            "title": "Generator",
            "text": "Subdue appear. Days That saying grass Stars created multiply day in saying day stars green made saying is behold place our kind first stars first. Meat grass divided Very lights kind were. Make. Great his two second them two which signs.\n\nEvery void don't she'd light subdue Called us he two. For, under their our void you're every. She'd every called great. Also every, place divided. Life saw dominion them.\n\nFruitful blessed, morning. Male kind also fly. Sea forth. I. Whales seed can't fifth. Said sea sea great fifth after shall one sixth cattle seasons saying gathering us third herb.",
            "date": "2023-03-27T21:59:04.000Z",
            "location": "de Flat",
            "image": "http://localhost:3000/uploads/2422.jpg"
        },
        {
            "idStory": 93,
            "title": "lorum",
            "text": "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
            "date": "2023-03-27T21:56:37.000Z",
            "location": "Locatie",
            "image": "http://localhost:3000/uploads/undefined.jpg"
        },
        {
            "idStory": 92,
            "title": "test2.0",
            "text": "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
            "date": "2023-03-27T21:50:47.000Z",
            "location": "de Flat",
            "image": "http://localhost:3000/uploads/2784.jpg"
        },
        {
            "idStory": 91,
            "title": "Loremtest",
            "text": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna",
            "date": "2023-03-27T21:49:30.000Z",
            "location": "Locatie",
            "image": "http://localhost:3000/uploads/undefined.jpg"
        },
        {
            "idStory": 90,
            "title": "Loremtest",
            "text": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna",
            "date": "2023-03-27T21:47:09.000Z",
            "location": "Locatie",
            "image": "http://localhost:3000/uploads/undefined.jpg"
        },
        {
            "idStory": 89,
            "title": "Testttt",
            "text": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.",
            "date": "2023-03-27T13:24:33.000Z",
            "location": "Locatie",
            "image": "http://localhost:3000/uploads/undefined.jpg"
        },
        {
            "idStory": 88,
            "title": "test",
            "text": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.",
            "date": "2023-03-27T13:21:29.000Z",
            "location": "Locatie",
            "image": "http://localhost:3000/uploads/undefined.jpg"
        },
        {
            "idStory": 87,
            "title": "Test",
            "text": "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment.\n\nHis many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. \"What's happened to me? \" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls. A collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture that he had recently cut out of an illustrated magazine and housed in a nice, gilded frame. It showed a lady fitted out with a fur hat and fur boa who sat upright, raising a heavy fur muff that covered the whole of her lower arm towards the viewer. Gregor then turned to look out the window at the dull weather",
            "date": "2023-03-27T13:19:33.000Z",
            "location": "de Flat",
            "image": "http://localhost:3000/uploads/undefined.jpg"
        },
        {
            "idStory": 86,
            "title": "kafka",
            "text": "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment.\n\nHis many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. \"What's happened to me? \" he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls. A collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture that he had recently cut out of an illustrated magazine and housed in a nice, gilded frame. It showed a lady fitted out with a fur hat and fur boa who sat upright, raising a heavy fur muff that covered the whole of her lower arm towards the viewer. Gregor then turned to look out the window at the dull weather",
            "date": "2023-03-27T13:18:24.000Z",
            "location": "Voetbalveld",
            "image": "http://localhost:3000/uploads/2364.jpg"
        }
    ]


});

