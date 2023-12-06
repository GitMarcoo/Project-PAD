// Test for making a forum message @author Saleeman
//Context: createForumMessage
describe("Create Message",  () => {

    //Run before each test in this context
    beforeEach(() => {
        window.localStorage.setItem("session", JSON.stringify({userId: 1}))
        //Go to the specified URL
        cy.visit("http://localhost:8080/#createMessage");
    });

    //Test: Validate Elements That should exist
    it("Valid Elements for creating message", () => {
        cy.get("#messageTitle").should("exist");

        cy.get("#messageText").should("exist");

        cy.get("#createMessagebtn").should("exist");
    });

    it("Wrong user input - Title",  () => {

        const input100Characters = "Ik test of mijn functie controleert hoeveel karakters een titel is en een alert " +
            "geeft om de gebruiker te informeren"

        // fill in the fields
        cy.get("#messageTitle").type(input100Characters);

        cy.get("#messageText").type("test");

        // click on the button
        cy.get("#createMessagebtn").click();

        // check to see if the user is alerted correctly
        cy.get(".wrong-input").should("exist").should("contain", `Titel is te groot! Mag max 100 
        karakters zijn en je hebt ${input100Characters.length} karakters`);
    });

    it("Wrong user input - Text",  () => {

        const input1000Characters = "Ik test of mijn functie controleert hoeveel karakters de text heeft en of de knop " +
            "disabled is wanneer het aantal karakters over de max gaat Ik test of mijn functie controleert hoeveel " +
            "karakters de text heeft en of de knop disabled is wanneer het aantal karakters over de max gaat" +
        "Ik test of mijn functie controleert hoeveel karakters de text heeft en of de knop disabled is wanneer het " +
            "aantal karakters over de max gaat" +
        "Ik test of mijn functie controleert hoeveel karakters de text heeft en of de knop disabled is wanneer het " +
            "aantal karakters over de max gaat" +
        "Ik test of mijn functie controleert hoeveel karakters de text heeft en of de knop disabled is wanneer het " +
            "aantal karakters over de max gaat" +
        "Ik test of mijn functie controleert hoeveel karakters de text heeft en of de knop disabled is wanneer het " +
            "aantal karakters over de max gaat" +
            "Ik test of mijn functie controleert hoeveel karakters de text heeft en of de knop disabled is wanneer het " +
            "aantal karakters over de max gaat" +
            "Ik test of mijn functie controleert hoeveel karakters de text heeft en of de knop disabled is wanneer " +
            "het aantal karakters over de max gaat";

        // fill in the fields
        cy.get("#messageTitle").type("test");

        // paste 1000 characters
        cy.get("#messageText").invoke("val", input1000Characters);
        cy.get("#messageText").type("einde");

        // check if the button is disabled if the character count exceeded the count limit
        cy.get("#createMessagebtn").should('be.disabled')

    });

    it("Successful message creation", () => {
        // Start a fake server
        cy.server();

        const mockedResponse = { "message": "Message added" };
        const userId = 1; // Hardcoded user ID

        // Intercept the POST request to /createMessage/*
        cy.intercept('POST', `/createMessage/${userId}`,{
            statusCode: 200,
            body: mockedResponse
        }).as('createMessage');

        // Type the message title and text
        cy.get("#messageTitle").type("test");
        cy.get("#messageText").type("test test");

        cy.get("#createMessagebtn").click();

        // Wait for the createMessage stub to be called
        cy.wait('@createMessage');
    });


    it("Failed attempt creating message",  () => {
        //Start a fake server
        cy.server();

        const mockedResponse = {
            reason: "ERROR"
        };

        const userId = 1; // Hardcoded user ID

        cy.intercept('POST', `/createMessage/${userId}`, {
            statusCode: 400,
            body: mockedResponse,
        }).as('createMessage');

        // fill in the fields
        cy.get("#messageTitle").type("test");
        cy.get("#messageText").type("test test");

        // click on the button
        cy.get("#createMessagebtn").click();

        // wait for the intercept
        cy.wait("@createMessage");

        // check to see if the user is alerted correctly
        cy.get(".wrong-input").should("exist").should("contain", "Geen verbinding met de server");
    });
});