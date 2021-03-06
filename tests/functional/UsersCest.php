<?php

class UsersCest
{
    protected $user = [
        'email' => 'bob1@test.pl',
        'firstName' => 'firstName',
        'lastName' => 'lastName',
        'slackId' => 'slackId',
    ];

    protected $userId;

    protected $admin = [
        'email' => 'admin@test.pl',
        'isAdmin' => true,
    ];

    protected $adminId;

    public function _before(FunctionalTester $I)
    {
        $I->haveInCollection('User', $this->user);
        $I->haveInCollection('User', $this->admin);

        unset($this->user['_id']);
        unset($this->admin['_id']);

        $this->userId = (string) $I->grabFromCollection('User', ['email' => $this->user['email']])['_id'];
        $this->adminId = (string) $I->grabFromCollection('User', ['email' => $this->admin['email']])['_id'];
    }

    public function tryToRegisterAndUpdate(FunctionalTester $I)
    {
        $I->login($this->user['email']);
        $id = $I->grabDataFromResponseByJsonPath('$.id')[0];

        $I->sendGET('api/users/'.$id.'.json');
        $I->seeResponseCodeIs(200);
        $I->seeResponseContainsJson(array_merge(['id' => $id], $this->user));

        $I->sendGET('api/users/current.json');
        $I->seeResponseCodeIs(200);
        $I->seeResponseContainsJson(array_merge(['id' => $id], $this->user));

        $this->user['nationality'] = 'Polish';
        $I->sendPUT('api/users/'.$id.'.json', $this->user);
        $I->seeResponseCodeIs(200);
        $I->seeResponseContainsJson(array_merge(['id' => $id], $this->user));

        $anotherUser = $I->grabFromCollection('User', ['email' => $this->admin['email']]);

        $I->sendPUT('api/users/'.$anotherUser['_id'].'.json', $this->user);
        $I->seeResponseCodeIs(403);

        $I->sendDELETE('api/users/'.$anotherUser['_id'].'.json');
        $I->seeResponseCodeIs(403);

        $I->sendDELETE('api/users/'.$id.'.json');
        $I->seeResponseCodeIs(204);

        $I->login($this->admin['email']);

        $I->sendGET('api/users/'.$id.'.json');
        $I->seeResponseCodeIs(404);
    }

    public function tryToGrantAndRevokeAdmin(FunctionalTester $I)
    {
        $user = $this->user;
        $user['id'] = $this->userId;

        $I->sendPUT('api/users/'.$user['id'].'/admin.json');
        $I->seeResponseCodeIs(401);
        $I->sendDELETE('api/users/'.$user['id'].'/admin.json');
        $I->seeResponseCodeIs(401);

        $I->login($this->user['email']);

        $I->sendPUT('api/users/'.$user['id'].'/admin.json');
        $I->seeResponseCodeIs(403);
        $I->sendDELETE('api/users/'.$user['id'].'/admin.json');
        $I->seeResponseCodeIs(403);

        $I->login($this->admin['email']);

        $id = $user['id'];
        unset($user['id']);

        $I->sendPUT('api/users/'.$id.'/admin.json');
        $I->seeResponseCodeIs(204);
        $I->seeInCollection('User', array_merge($user, ['isAdmin' => true]));

        $I->sendPUT('api/users/'.$id.'/admin.json');
        $I->seeResponseCodeIs(204);
        $I->seeInCollection('User', array_merge($user, ['isAdmin' => true]));

        $I->sendDELETE('api/users/'.$id.'/admin.json');
        $I->seeResponseCodeIs(204);
        $I->seeInCollection('User', array_merge($user, ['isAdmin' => false]));

        $I->sendDELETE('api/users/'.$id.'/admin.json');
        $I->seeResponseCodeIs(204);
        $I->seeInCollection('User', array_merge($user, ['isAdmin' => false]));
    }

    public function tryToLinkUnlinkSkills(FunctionalTester $I)
    {
        $I->haveInCollection('Skill', ['name' => 'skill1']);
        $skill1Id = (string) $dbUser = $I->grabFromCollection('Skill', ['name' => 'skill1'])['_id'];
        $I->haveInCollection('Skill', ['name' => 'skill2']);
        $skill2Id = (string) $dbUser = $I->grabFromCollection('Skill', ['name' => 'skill2'])['_id'];

        $I->sendPUT('api/skills/'.$skill1Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(401);

        $I->sendDELETE('api/skills/'.$skill1Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(401);

        $I->login($this->user['email']);

        $I->sendPUT('api/skills/'.$skill1Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(204);

        $I->sendGET('api/users/current.json');
        $I->seeResponseContainsJson(['skills' => ['id' => $skill1Id]]);
        $I->dontseeResponseContainsJson(['skills' => ['id' => $skill2Id]]);

        $I->sendPUT('api/skills/'.$skill2Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(204);

        $I->sendGET('api/users/current.json');
        $I->seeResponseContainsJson(['skills' => ['id' => $skill1Id]]);
        $I->seeResponseContainsJson(['skills' => ['id' => $skill2Id]]);

        $I->sendDELETE('api/skills/'.$skill1Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(204);

        $I->sendGET('api/users/current.json');
        $I->seeResponseCodeIs(200);
        $I->dontseeResponseContainsJson(['skills' => ['id' => $skill1Id]]);
        $I->seeResponseContainsJson(['skills' => ['id' => $skill2Id]]);

        $I->sendGET('api/skills/'.$skill1Id.'.json');
        $I->seeResponseCodeIs(200);
        $I->dontseeResponseContainsJson(['users' => ['id' => $this->userId]]);

        $I->sendGET('api/skills/'.$skill2Id.'.json');
        $I->seeResponseCodeIs(200);
        $I->seeResponseContainsJson(['users' => ['id' => $this->userId]]);

        $I->sendPUT('api/skills/'.$skill2Id.'/users/'.$this->adminId.'.json');
        $I->seeResponseCodeIs(403);

        $I->login($this->admin['email']);

        $I->sendPUT('api/skills/'.$skill2Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(204);
    }

    public function tryToLinkUnlinkTeams(FunctionalTester $I)
    {
        $I->haveInCollection('Team', ['name' => 'team1']);
        $team1Id = (string) $dbUser = $I->grabFromCollection('Team', ['name' => 'team1'])['_id'];
        $I->haveInCollection('Team', ['name' => 'team2']);
        $team2Id = (string) $dbUser = $I->grabFromCollection('Team', ['name' => 'team2'])['_id'];

        $I->sendPUT('api/teams/'.$team1Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(401);

        $I->sendDELETE('api/teams/'.$team1Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(401);

        $I->login($this->user['email']);

        $I->sendPUT('api/teams/'.$team1Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(204);

        $I->sendGET('api/users/current.json');
        $I->seeResponseContainsJson(['teams' => ['id' => $team1Id]]);
        $I->dontseeResponseContainsJson(['teams' => ['id' => $team2Id]]);

        $I->sendPUT('api/teams/'.$team2Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(204);

        $I->sendGET('api/users/current.json');
        $I->seeResponseContainsJson(['teams' => ['id' => $team1Id]]);
        $I->seeResponseContainsJson(['teams' => ['id' => $team2Id]]);

        $I->sendDELETE('api/teams/'.$team1Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(204);

        $I->sendGET('api/users/current.json');
        $I->seeResponseCodeIs(200);
        $I->dontseeResponseContainsJson(['teams' => ['id' => $team1Id]]);
        $I->seeResponseContainsJson(['teams' => ['id' => $team2Id]]);

        $I->sendGET('api/teams/'.$team1Id.'.json');
        $I->seeResponseCodeIs(200);
        $I->dontseeResponseContainsJson(['users' => ['id' => $this->userId]]);

        $I->sendGET('api/teams/'.$team2Id.'.json');
        $I->seeResponseCodeIs(200);
        $I->seeResponseContainsJson(['users' => ['id' => $this->userId]]);

        $I->sendPUT('api/teams/'.$team2Id.'/users/'.$this->adminId.'.json');
        $I->seeResponseCodeIs(403);

        $I->login($this->admin['email']);

        $I->sendPUT('api/teams/'.$team2Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(204);
    }

    public function tryToLinkUnlinkEvents(FunctionalTester $I)
    {
        $I->haveInCollection('Event', ['name' => 'event1']);
        $event1Id = (string) $dbUser = $I->grabFromCollection('Event', ['name' => 'event1'])['_id'];
        $I->haveInCollection('Event', ['name' => 'event2']);
        $event2Id = (string) $dbUser = $I->grabFromCollection('Event', ['name' => 'event2'])['_id'];

        $I->sendPUT('api/events/'.$event1Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(401);

        $I->sendDELETE('api/events/'.$event1Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(401);

        $I->login($this->user['email']);

        $I->sendPUT('api/events/'.$event1Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(204);

        $I->sendGET('api/users/current.json');
        $I->seeResponseContainsJson(['events' => [['id' => $event1Id]]]);
        $I->dontseeResponseContainsJson(['events' => [['id' => $event2Id]]]);

        $I->sendPUT('api/events/'.$event2Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(204);

        $I->sendGET('api/users/current.json');
        $I->seeResponseContainsJson(['events' => [['id' => $event1Id]]]);
        $I->seeResponseContainsJson(['events' => [['id' => $event2Id]]]);

        $I->sendDELETE('api/events/'.$event1Id.'/users/'.$this->userId.'.json');
        $I->seeResponseCodeIs(204);

        $I->sendGET('api/users/current.json');
        $I->seeResponseCodeIs(200);
        $I->dontseeResponseContainsJson(['events' => [['id' => $event1Id]]]);
        $I->seeResponseContainsJson(['events' => [['id' => $event2Id]]]);

        $I->sendGET('api/events/'.$event1Id.'.json');
        $I->seeResponseCodeIs(200);
        $I->dontseeResponseContainsJson(['users' => [['id' => $this->userId]]]);

        $I->sendGET('api/events/'.$event2Id.'.json');
        $I->seeResponseCodeIs(200);
        $I->seeResponseContainsJson(['users' => [['id' => $this->userId]]]);

        $I->sendPUT('api/events/'.$event2Id.'/users/'.$this->adminId.'.json');
        $I->seeResponseCodeIs(204);

        $I->sendGET('api/events/'.$event2Id.'.json');
        $I->seeResponseCodeIs(200);
        $I->seeResponseContainsJson(['users' => [['id' => $this->userId], ['id' => $this->adminId]]]);
    }
}
