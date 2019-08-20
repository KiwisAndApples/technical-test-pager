# Aircall Technical Test - Aircall Pager

The goal of this test is to evaluate :
- your modeling and testing skills of a small business case
- your ability to pair program with someone to add new features
- your ability to present your project to an audience

# Agenda
The following test has 2 parts:
- first one at home to design an implement a domain model (~1-2h)
- second one onsite, to add new features during a pair programming session and to present the result to some engineers (2 x 1h)

# Use case
Let's imagine we need to implement an alerting system for our production services:
- A **Service** (identified by its unique name) can __crash__ and __start__ an **Alert** containing an error message.
- A **Service** can have an **Escalation Policy** associated to it. 
- An **Escalation Policy** has several **Levels**, each containing the list of **Targets** to notify (e-mails or phone numbers). 
- An **Alert** __iterates__ from one **Level** to another after some period of time if nobody handled it.
- When someone __handles__ the **Alert**, the system stops escalating it.

## 1. Homework (1h)
Implement a model and unit tests for this alerting system with the programming language and paradigm you prefer.
You don't need to implement any delivery and persistence mechanisms (no web server, no workers, no database).
This is just about pure domain modeling. Keep things simple and straighforward.

## 2. Pair programming (1h)
Debrief on the model.
Implement a persistence system on top of the filesystem for Escalation Policies and Alerts
Implement 2 API endpoints: 
- "/service/:name/crash" (to trigger an escalation workflow if needed)
- "/alerts/:id/next" (to go through escalation levels)

## 3. Presentation and collective review (1h)
Presentation of the whole project