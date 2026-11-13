# Invisible connectivity: challenge interview

Cleaned transcript merged from the two supplied versions of the same conversation. Material present in either version is retained without duplicating the discussion. Speaker labels indicate conversational roles, not identified individuals. Unrecoverable wording is marked in brackets; numerical estimates and descriptions of policy remain the speakers' statements.

Participant: From what I understand, C-arms have different kinds of updates. Some can be started remotely. Others require a person in the room because the system recalibrates its endpoints, moving like a 3D printer. Nobody should be in the way—for example, a cleaner working nearby.

At the beginning, we asked ourselves: why does a person actually need to be there to perform an update? What is the time-consuming part? Could some of it run in parallel? Could we change the process?

Ultimately, what is the actual problem? Which pain point do we need to address to make an impact?

Expert: You are mostly right about what you have described. Let me start with the biggest challenge we currently face.

For mobile devices in the clinical environment, the biggest problem is that when they are not being used, they are switched off. They are usually parked somewhere in a hallway, and nobody pays attention to them because they are not needed.

Often there is no power outlet there. Sometimes there is, sometimes there is not, so we cannot rely on it. We cannot simply say, “Plug it in, switch it on, and everything will run in the background even while you are not using it.” That would be an ideal world, but it is not possible in every hospital.

When the system is needed, staff bring it into the operating room, plug it in, position it, apply the drapes, and prepare the patient.

From plugging it in and switching it on to the start of surgery, there is at most about an hour, and often less—even if connecting it is the first thing they do.

A minute of operating-theatre use costs something like €80. Costs accumulate quickly, so hospitals try to use that time efficiently.

The window of opportunity is therefore limited to the time between switching the system on and starting surgery. Once surgery has begun, background operations are no longer allowed on the system. It must work reliably. Imagine it suddenly saying, “I need to restart now,” and shutting down.

Participant: So the underlying problem is connectivity.

Expert: Exactly. Connectivity is poor largely because these mobile systems are switched off. When they are on, the available window is small.

Updates are one part of that. The packages can be large, but they download in parts whenever the system has a connection. Once the full package has been downloaded and the checksum is correct, the system tells the user that an update is available.

Then the question becomes: who is responsible for installing it?

Is it the person operating the system—the X-ray nurse from our example? That person is already in the surgical environment, but may not be particularly comfortable with IT and does not want to be blamed if something breaks. So they avoid starting it.

Participant: What is the main emotion there? Is the complexity overwhelming, or is it the pressure of being responsible if something goes wrong?

Expert: Mainly the pressure if something goes wrong.

Participant: How often do updates fail?

Expert: Roughly 2%. Most of the time they work, but there is still a chance of failure, and you worry about the one time when you really need the system.

Participant: So the nurse has to find the right opportunity inside an already pressured, overworked environment.

Expert: Exactly.

The next possible person is the physicist or the biomedical engineering team—the people responsible for the hospital's equipment, radiation-safety checks, and so on.

They might look after a fleet of a hundred systems. They do not want to go to the surgical department, wait for a system to become available, plug it in, and update it.

Participant: Is there a scheduling system for that? Would a scheduling assistant help someone responsible for the fleet see which systems are available and which are already being updated?

Expert: Scheduling could be one part of a solution.

Participant: At the moment, does the physicist have to call the department and ask when there is a window?

Expert: Exactly. And the department may say, “We don't know when the next emergency will come in.” There is a lot of communication involved.

Participant: Does the C-arm platform—Artis or Cios, whichever system we are discussing—have a UPS?

Expert: It has a UPS, but only for a short period. If power is disconnected, it saves the images and shuts the system down safely. It is not intended to keep the system operating.

Participant: Returning to the physicist: it is difficult to find a window and obtain clearance from the department. Better communication could help, instead of phone calls or emails that people cannot deal with.

Participant: Or faxes.

Participant: The X-ray nurse might be the department contact and the person who eventually presses the button. Supporting that communication could empower them.

Expert: Yes. And to return to your original assumption: most of our updates are remote-capable.

Some updates involve hardware changes, and someone obviously has to go on-site to replace the hardware. They can also handle the software update while they are there. But we try to avoid on-site visits where possible because of the cost.

For security updates, such as regular Microsoft vulnerability patches, about 99% are remote-capable. We push the package to the system and it appears as available.

There still has to be a human in the loop who presses the button and confirms that this is the right time. We are not allowed simply to start it automatically. That is the regulated world of medical imaging.

The last possible person is the IT administrator. Especially in large hospital groups, IT may be centralized somewhere else or otherwise remote from the clinical department.

They may have a login to teamplay Fleet, our fleet-management platform. They can see the systems, available updates, and perhaps information about what each update changes.

But they are not the person who will go to the operating room at 7:30 in the evening to press the update button. They are already home.

So there are three groups who could be responsible for performing updates, but the task falls between them.

Participant: Like a football situation where nobody takes the shot.

Expert: There is a second angle, too. Connectivity matters not only for updates but also for receiving log data.

In an ideal world, the system would send each newly created log file to our backend. Imagine an AI analyzing it and saying, “It looks as if the X-ray tube may fail next week.”

We could call the customer before it breaks, schedule a replacement, and perhaps suggest using a different system for the next two procedures. Then we could come the next day and fix it before a failure occurs during surgery.

That would be an ideal service situation, but we need the data. If the system is not connected, we do not receive the logs.

One approach is to find the golden windows of opportunity in the workflow and clarify who connects the system, who starts the update, and who sends logs.

A second approach is a technical solution that separates backend communication from the main system. Think of a battery-powered mini PC or Raspberry Pi. It downloads updates and uploads logs independently. When the main system is switched on, it transfers the prepared update to it.

Participant: Could we rethink the overall architecture? With electric scooters, operators originally collected them in vans to recharge them. Now they swap batteries.

Why not do something similar with the computer? Pull out the old PC and insert another one that is already updated.

Expert: That implies having roughly twice as many PCs as systems, and the computer is a fairly expensive component.

Participant: But what actually needs updating? The GPU hardware is expensive, of course, but are we updating the BIOS or embedded components?

Expert: The system has many embedded and distributed components. There may be a patch for subsystem A or B but not C. We might update a motor controller because of a system-motion problem. There may be imaging-software fixes, ordinary application bug fixes, or Microsoft vulnerability patches.

I like the idea of pulling out one unit and plugging in a prepared replacement. But it solves only the PC part, not the distributed components.

It also still requires someone to go there, open the system, remove the PC, and fit the replacement. It is not currently plug-and-play.

Participant: How often do updates require actual hardware changes?

Expert: We try to limit on-site hardware changes to about once every two years.

Vulnerability patches are intended to come every three months—four per year in an ideal world.

The frequency of updates to distributed components is harder to state. It depends on the problems and customer complaints we need to address.

Participant: What about keeping two software images for each subsystem?

Suppose subsystem A is the main PC, B controls the motors, and C handles imaging. You keep B1 as the current version and prepare B2 as the updated version.

B2 could be downloaded and installed in the background, a little like preparing a new Docker container. You copy the required parameters and, after the procedure, restart or switch over to the new image.

For an update that does not require calibration, perhaps the switch could happen during the cleaning and preparation period between procedures. You would retain the other image as a fallback.

Expert: I would love it if it worked that way. That is similar to what happens with cloud deployments: prepare a new container and switch to it.

Unfortunately, these systems do not yet have an architecture that supports that approach. But that should not limit your thinking.

Participant: What devices do X-ray nurses use day to day? A DECT phone, a smartphone? Do you have software on those devices that could notify them?

Expert: Usually not. It is a good question. I do not know of a dedicated operator application that sends update reminders or push notifications.

Participant: An advance notification could help.

When I first read the challenge, I also thought about changing the mindset through gamification. That is where the Tamagotchi idea came from: make caring for the system more playful and encourage people to keep it “alive.”

Behind that could be an AI orchestrator that coordinates the different people, uses system-usage data and planned cases, and identifies suitable opportunities.

What proportion of procedures is planned?

Expert: During the day, depending on the hospital, I would estimate 85–90%. The rest includes emergencies.

Hospitals may try to leave at least one theatre available for emergencies, depending on their size. During the night, fewer theatres are used.

I recently visited a hospital with twelve operating theatres. During the day, they were more or less fully booked from eight in the morning until five in the afternoon. At night, they used two or three because they did not have staff for more.

Participant: What are typical emergency cases requiring a C-arm?

Expert: A car accident, for example. A patient arrives with multiple injuries, and the team determines what needs treatment.

C-arms are often used in orthopaedic and trauma surgery. Some fractures are scheduled rather than operated on immediately.

Participant: Do you mean a compound fracture? A friend of mine had an open fracture and was treated right away.

Expert: It depends on what needs urgent treatment. Other cases are elective—for example, a torn ligament that can be scheduled for a later date.

[The wording around fracture types and waiting one or two days is inconsistent in the source recordings.]

Participant: The reason I ask is that an AI scheduling system could also consider incoming emergencies. Some patients are already registered through the emergency dispatch centre—the Leitstelle—before reaching the hospital.

If an incoming case is likely to require this equipment, the system could warn the X-ray operator that the device will probably be needed and that this is not a suitable time to start an update.

Expert: When a patient with multiple serious injuries is coming in, there is a polytrauma alarm. The relevant specialties assemble, assess the patient, and are dismissed as their involvement is ruled out.

If there is no immediate issue that must be addressed first, such as severe bleeding, the patient will typically undergo an initial assessment and a full-body CT.

If the team identifies something requiring immediate surgery, they contact the operating department and request a theatre urgently.

Participant: So that existing signal could be used as an input or trigger.

Expert: Yes.

Participant: Once someone starts an update at the machine, is there any further control over it?

Expert: It is “fire and forget”—or rather, “fire and pray.”

Participant: What happens if it fails? Is the system bricked, or does it roll back?

Expert: Usually there is a rollback. How long it takes depends on how far the update progressed.

Participant: You also back up the system parameters before an update. Could incompatibility with those parameters cause a problem?

Expert: Yes.

There is a situation we call “dead on arrival”: you update the system and it is unusable afterwards. The rough likelihood mentioned earlier was about 2%.

There are many possible causes. A user may switch it off because they think it has finished. Someone may not know an update is running and unplug it to save energy. A subsystem may be unreachable, causing an error state. There may be a storage-space problem.

We perform many pre-checks, including checking that there is enough space to unpack the executable, but problems can still happen.

Participant: Can you estimate the duration of an update beforehand?

Expert: Roughly, yes. The example screen you saw said 120 minutes.

Participant: Was that exaggerated?

Expert: No. That is a fairly average update time.

Participant: Would a more powerful computer reduce it, or is processing power not the main limitation?

Expert: It is the amount of work that needs to be done.

Participant: If the system sends a signal when the update starts, and it is not back after the estimated two hours plus a buffer, that could indicate a failure.

How do you currently find out?

Expert: Someone calls us and complains.

Participant: How does that feed into incident management and rollout planning? Do you stop a rollout after a failure?

Expert: We usually roll out in phases. One customer reporting a failure is probably an isolated problem. Twenty customers reporting the same thing at once would cause us to stop the update.

One failure in a hundred could be due to the user, a particular system condition, or a transient problem. Sometimes running the update again works.

If we identify a systematic problem, we stop the rollout.

The difficulty is that packages have already been sent to systems, and those systems do not all install them at the same time. Even after we stop the rollout, some machines may already hold a package that we know is faulty. If the user starts it, it could fail.

We then need a way to withdraw the package from those systems as well.

Participant: Welcome to real life.

Expert: Yes. Sometimes it is not funny.

Participant: What about the software platform and backward compatibility? Is this running on syngo Native or a classic architecture?

Expert: Our systems do not run on syngo Native. They use [platform name unclear; the two transcriptions disagree].

Participant: What is the most unusual thing Siemens Healthineers has tried to solve this problem, and why did it not work?

Expert: That is a difficult question. Let me think about a specific example.

More generally, we have been trying to solve connectivity for roughly two decades, and it has not improved much.

Some customers make a real effort to keep their systems connected and updated, but it remains a very manual process. Others do not prioritize it.

Think about the difference from a stationary CT scanner, MRI scanner, or X-ray system in radiology. It has a fixed location, a connection to the hospital network, and from there a connection to the Siemens network.

IT sets that up once, and it works. We receive data; the system receives updates.

Those departments also have predictable schedules. Patients arrive from eight in the morning until five in the afternoon. If there are three CT scanners, perhaps two remain available at night, and someone can start the update on the other before leaving.

Mobile systems do not have that same arrangement. There may be several units and backup equipment, but staff treat them as tools that must work rather than as equipment they want to spend time maintaining.

Radiology staff have specifically chosen to work with imaging equipment. In surgery, the C-arm is more like a screwdriver or a bone saw: it is a tool needed to get the procedure done.

Participant: Do the X-ray nurses in your example only operate C-arms, or do they also maintain other diagnostic systems?

Expert: They are part of the surgical team. They operate the C-arm, but they may also help with other things, such as getting a set of screws for the procedure.

They are not responsible for maintaining the hospital's other diagnostic imaging equipment.

Participant: That would be the physicist and their team?

Expert: Possibly. There might be a team, or it might be one person. It depends on the size of the hospital.

The answer to about 90% of these organizational questions is, “It depends on the hospital.”

Participant: Why not simply increase the size of the UPS battery?

Expert: Cost, size, and weight. The system needs to remain easy to manoeuvre.

An operating theatre is already crowded. There are life-support devices, the table, positioning equipment, the patient, several surgeons, and staff handling sterile instruments. Space is limited, and you cannot interfere with sterile areas.

Participant: Suppose power fails during a procedure in a hospital without a working backup supply. Does the machine stay on?

Expert: It performs a safe shutdown. It saves the images and shuts down.

Participant: Why is the challenge called “invisible connectivity”? You have been trying to improve connectivity for years using things like Wi-Fi.

Expert: An interesting example: the university hospital in Erlangen does not allow Wi-Fi in its operating theatres.

Participant: What connections does the device have? Bluetooth, USB, Wi-Fi?

Expert: It has Wi-Fi, LAN, and USB. It does not have Bluetooth.

Participant: And it only works while plugged in?

Expert: Yes.

Participant: Earlier, you described idle time in the hallway as a potential opportunity for updates—if the system had power.

How much energy does a two-hour update require? Presumably you do not need to power the X-ray source, detector, and motors in the same way as during a procedure.

Expert: I do not know the power consumption.

Participant: That could lead us from a battery pack to a robot. We could reuse the service-companion idea: a robot with a battery backpack that connects the system to power and helps update it.

Participant: If only the computer needs the update, perhaps it is mainly a matter of writing the software to storage and booting the new version.

Expert: That depends on whether the distributed subsystems also need updating.

Participant: True. But if we focus on frequent security patches, those are mainly on the computer.

Expert: The imaging application runs on the computer as well. Other updates may involve separate subsystems.

Participant: What prevents changing the software architecture? For CT and MRI, there has been a move from classic platforms toward syngo Native. Why not do that for mobile systems?

Expert: Working with syngo Native has its own challenges. It is also a very large package. It can make sense for CT and MRI, but for our use case we would use only a small fraction of it. It is too large for what we need.

Returning to the question about the challenge's name: we want connectivity to be invisible to the user.

The user should not have to think, “Is the system connected?” It should simply work. Connectivity should not occupy their attention.

Participant: Could “connection” also mean an emotional connection? With a Tamagotchi-like system, you would not want to let it die.

Expert: Yes, if you can make that work.

Participant: We have talked about updates that can make the machine move for calibration. Where is that done? You would not want it moving unattended in a hallway.

Expert: Mechanical work, calibration of movement limits, detector calibration, or X-ray tube calibration is performed by a Siemens service technician on-site.

They arrange an appropriate room and control the area. Because X-ray radiation may be involved, they must make sure people cannot simply walk through.

When a service engineer is there, they can also handle the software update. That part is not what you need to solve.

The system is not allowed to perform autonomous movement in an uncontrolled storage area. It might be under a shelf, damage itself, or move into someone walking past.

Participant: So we can keep that mechanical-calibration scenario outside the scope and focus mainly on software.

Expert: Yes. Think about three things: software updates, connectivity to receive those updates, and a return channel for log files.

Participant: If some hospitals do not allow Wi-Fi, could a local wireless device help? For example, a LoRa-based device or another local communication system that distributes packages within the hospital.

The update could first be downloaded to a device in the IT office. Then it could send the local copy to the relevant systems whenever they are available, instead of each system needing its own direct internet connection.

Expert: It could be an idea to explore. I am not prescribing your technology stack.

Participant: Based on your experience, which technology or approach gives you the most hope of solving this?

Expert: I think an autonomous device alongside the main system could help a lot. It could maintain connectivity even when the main system is switched off.

That removes the dependency on the main system being powered and available for communication. You move that part of the challenge to a separate device.

There could even be a wired connection between the two. Transferring a large package over gigabit Ethernet can be fast.

Suppose an update were ten gigabytes—I am making up a number. Moving that locally over a gigabit LAN connection would be much quicker than waiting for an unreliable connection.

The important part is that it works in both directions: bring data to the system and take data from the system back to the backend.

You still need to solve the technical questions. How do the two devices communicate? How is the companion device powered? How do you maintain its battery?

We have discussed this with R&D. People like the idea but then produce many reasons why it will not work. I would like to show that it can work.

Participant: Does the existing power cable use a regular Schuko plug?

Expert: Yes. A regular mains connection—the speaker described it as 220 volts.

Participant: What was the problem with having the last person leave the system switched on, or turn it on for an update after the final procedure?

Expert: Nobody feels responsible.

Participant: So it is not necessarily about formal responsibility, but about feeling responsible.

Expert: Exactly. You also need somewhere to park it with a power connection.

For some hospitals, that is straightforward. For others, there are not enough hallway outlets, or the system is parked in a storage room without a convenient connection.

Participant: And someone may feel they have to wait until the update finishes.

Expert: Yes. Once started, it usually runs autonomously to completion, but that concern remains.

Participant: A service companion could help create that emotional connection.

Participant: Like my wife and me getting a dog to see whether we could look after another living being before having a child.

Participant: What happened to the dog?

Participant: There is a phrase for that: DINKWAD. Do you know DINK?

Participant: Double income, no kids.

Participant: DINKWAD is “double income, no kids, with a dog.” I recently learned it and thought it fitted.

There is also SINK: single income, no kids.

Participant: SINK, DINK, DINKWAD—a natural evolution.

Participant: Thank you for your time.

Expert: Of course. If you need anything, I will be around for the next two days. Hopefully I will have a voice tomorrow as well. Have fun.
