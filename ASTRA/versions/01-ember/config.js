/* Each line is a live cue, not an additional slide. The film's native end owns the title handoff. */
window.PITCH = {
  id:'01-ember', title:'Ember', direction:'Your feedback, distilled.',
  accent:'#80e5d1', gold:'#f0c571', paper:'#f6f2e9', moodStyle:'editorial', calendarStyle:'theatres', workflowStyle:'river',
  moods:[
    ['lonely','GHOSTED.','Disconnected.','“Do you even think about me?”','Cio has been offline for days. Now the machine makes that visible.'],
    ['manic','NEEDY.','Patch overdue.','“I have needs. And firmware.”','A security patch is waiting. Our very subtle reminder.'],
    ['update','DO NOT DISTURB.','Updating.','“Personal growth in progress.”','Updating. Please respect this deeply personal transformation.'],
    ['bliss','THRIVING.','Connected and current.','“New software. New me.”','Connected and current. This is the face we want to see.'],
    ['failure','IT’S COMPLICATED.','Update failed.','“I was better before therapy.”','If the update fails, the problem stays visible.'],
    ['rollback','BACK, BABY.','Recovery state.','“Character development. Reversed.”','And recovery brings our old friend back.']
  ],
  calendarTitle:'The right moment.',
  workflowTitle:'From a window<br>to a working machine.',
  closing:['We take care<br>of the machine.','You take care<br>of the patient.'],
  cues:[
    [0,'film',0,'The film','[Silence. Let the original movie play in full.]'],
    [30.442667,'intro',0,'The landing','[Let “Based on a true story” land. The embers become Aloha. No extra narration.]'],
    [36,'moods',0,'Meet C-ARMAGOTCHI','Meet C-ARMAGOTCHI. A machine you can actually care about. Disconnected? It feels ghosted.'],
    [41,'moods',1,'Overdue','Patch overdue? It gets needy. Very needy.'],
    [46,'moods',2,'Updating','Updating. Personal growth takes a moment.'],
    [51,'moods',3,'Connected','Connected and current. New software, new me.'],
    [56,'moods',4,'Failure','A failed update stays visible.'],
    [61,'moods',5,'Recovery','Recovery brings our old friend back.'],
    [66,'moods',6,'The loop','[Let the accelerating character loop and TV shutdown finish.]'],
    [68,'cut',0,'Now','[Pause. Let the room change.]'],
    [72,'cut',1,'Invisible connectivity','The personality makes you care. The system takes care of the work.'],
    [76,'calendar',0,'A real day','This is the day the hospital planned. Every case matters. An empty square alone is not permission to update.'],
    [86,'calendar',1,'The opening','Then a case is cancelled. An opportunity appears.'],
    [91,'calendar',2,'Search','Our scheduler searches the operating plan, device use and update requirements together.'],
    [104,'calendar',3,'Challenge the gap','It challenges each gap against emergency demand, recovery time and backup coverage.'],
    [114,'calendar',4,'The golden window','Here is the strongest eligible candidate in this demonstration. Cio can be serviced, and another device remains available.'],
    [120,'calendar',5,'The decision','Medical physics reviews the proposal. A person owns the decision.'],
    [124,'workflow',0,'The system','The workflow is simple to see.'],
    [132,'workflow',1,'The intelligence','Specialists find the opportunity and check readiness. Tested rules constrain the plan.'],
    [141,'workflow',2,'The human','People authorize the window and the start.'],
    [149,'workflow',3,'The connection','Our robot concept brings power and the approved package to the parked machine.'],
    [158,'workflow',4,'The return','Verification and logs close the loop. Our working prototype demonstrates the planning and handoffs. These live clinical connections are the next step.'],
    [166,'outro',0,'Our job','We take care of the machine.'],
    [172,'outro',1,'Their job','You take care of the patient. [Hold. Finish.]']
  ]
};
