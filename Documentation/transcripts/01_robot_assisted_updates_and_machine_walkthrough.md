# Robot-assisted updates and machine walkthrough

Cleaned transcript. Speaker labels indicate conversational roles, not identified individuals. Unrecoverable wording is marked in brackets; proposals and estimates remain statements made in the conversation.

Participant: What does this thing do?

Expert: It takes an X-ray.

Participant: An X-ray, okay. Do you want to take an X-ray of my hand? I do have problems with my hands.

[Part of the opening conversation about hands, equipment, and demonstrations is unclear.]

Participant: If it were an MRI scanner, I would say, “Hey, just jump into that seat.”

Participant: This is also a big issue. [The reference to German education is unclear.]

Participant: We also found something [unclear], and she had to be treated with chemotherapy and everything.

Participant: Wow. If you look closely enough inside your body, you might find something else.

Participant: Isn't there a medical consent form for that? You explicitly sign whether you want to be informed if they find something unexpectedly.

Expert: Yes. When people volunteer for MRI tests, they normally have to sign whether they want to be contacted if something else is found.

Participant: Are they compensated?

Expert: I don't know how much, but sometimes they are. Sometimes they also look for obese participants to mimic the size of football players, because they want to sell a CT scanner for a football stadium in the United States.

Participant: There is a startup with a device that scans the eyes. I'm not sure about the company, but I think it can tell within the first 60 to 120 seconds whether someone might have a concussion. It is intended for concussion assessment.

Expert: There is also a small mobile C-arm that runs entirely on batteries. [The manufacturer or reseller name is unclear.] It is quite popular in the US. At professional games, they can keep it folded up next to the sideline.

Participant: Just to clarify: those two work for Siemens; I don't. If you want me to leave the room for any part of the discussion, that's fine.

Expert: No, that's fine.

Participant: I don't think they trust us with proprietary information yet.

Participant: Can I pitch our idea, or do you have questions first?

Expert: Give us the idea first.

Participant: Basically, there are two challenges: finding the right window for an update, and sending someone to the machine to do it. The machine must be physically available and have power.

We thought about an AI orchestration layer that finds the right time and then sends a robot to the machine. The robot would carry a battery pack, connect the machine to power, and, if Wi-Fi is unavailable or the software package has not been downloaded, connect via USB or Ethernet to transfer the update and verify it.

That is the idea we are exploring. We also heard that people are looking at robots for basic service-engineering tasks, such as removing and replacing covers.

Participant: Looking at this machine, is it a typical system, or is it not on the market yet?

Expert: The setup is broadly similar. Future systems may look more like this because we are moving toward a [design approach unclear].

[The following explanation of the design and controls is unclear.]

Participant: Where is the power cable? Where does power enter the system or the computer?

[The expert points out connections on the machine; part of the explanation depends on the physical demonstration.]

Participant: How do people in the hospital normally store the cable? Do they roll it up and put it over the handles? Is that the standard way?

Expert: There is not really another convenient place for it. You would not put it over the C-arm itself. In some places it would fall off; in others it would not fit. Holding it here is the easiest way.

Participant: Can we take a photo of an existing machine showing where the cable is stored? We can keep talking while we do that.

So this is like an extension cord, and you plug it into the socket?

Expert: Yes.

Participant: Perfect. And where are the Wi-Fi and Ethernet connections?

Expert: On this older machine, the Ethernet connection is on the trolley.

Participant: Does the system work without the monitor?

Expert: No. This system needs that part of the setup.

Participant: What is this control panel for?

Expert: There is no other control panel on the C-arm. This is an older, lower-cost machine, so it has a button-based panel.

Participant: Just to make sure there isn't a flaw in our idea: if I take this Schuko plug and connect it to a portable battery power supply, would that provide enough power?

Expert: I would have to check. For the concept, I would think about newer systems, where everything is integrated into the unit. The Schuko connection is here, and the relevant connections are accessible at the back.

Participant: Could it use PoE—Power over Ethernet?

Expert: I don't know whether it could deliver enough power. I have never checked that.

Participant: For the modern machines, connecting an appropriate power source should at least let us power the system. Do we then need to press a button to start it?

Expert: Yes, that button normally needs to be pressed manually.

Participant: Could you use Wake-on-LAN? You connect an RJ45 Ethernet cable and send a signal to wake the machine.

Expert: That should normally work for booting the PC inside, although the customer does not have direct access to the PC.

Participant: Our value proposition is that the robot comes here and connects the system. Connecting it is one part, but starting it is another. If the robot can send a wake signal, that might be a software solution. If a physical button must be pressed, we need to account for that.

The robot could also have a camera to scan the surroundings. Someone could remotely check whether this is the right time, whether the surroundings are suitable, and whether anything near the machine should prevent the update from proceeding. The idea would be to stop the update if something in the surroundings made it unsuitable.

Participant: How big is the power supply for the computer? What is its power rating?

Participant: I started thinking about a second, small PC. It could be one of those compact computers with power consumption around 25 watts. A portable battery could keep it running while the rest of the machine is switched off.

The rough example I had in mind was a battery around 500 watt-hours, about this size, giving several hours of backup. [The speaker suggested six hours; the power, capacity, and runtime figures were not reconciled in the conversation.]

That mini PC could prepare an update in advance. Instead of manually swapping the computer, you would switch over to the prepared software image when the system next shuts down and starts up.

The idea is that unpacking and installing the package would already have happened on the mini PC. Then perhaps a 120-minute update could become a four- or five-minute transfer and switchover. The Tamagotchi could be the interactive part during those few minutes. That would reduce the pain.

Participant: Let's discuss that.

Participant: Another idea: could we use wireless charging? Instead of a robot arm plugging in a cable, the robot could come close enough to a receiver coil and transfer energy to an internal battery or power supply.

Participant: There are approaches to wireless power transfer.

Participant: Is that what you meant when you were joking about Tesla coils yesterday?

Participant: It works.

Participant: But would the mini-PC idea be a complete pivot from our original idea?

Participant: I see them as two solutions to the same problem. Some hospitals are still quite old-fashioned and manually enter the day's patient information. At the end of the day, they switch the machine off. The whole machine could be off while a small battery keeps the mini PC running. That battery could recharge while the main system is in use.

Expert: You cannot guarantee that systems will be stored neatly or accessibly. Sometimes they are pushed so close together that a robot could have difficulty reaching them.

Participant: What if we positioned the computer differently?

Expert: You would have to define the requirements. The challenge owner may already have been hinting at something along those lines.

Participant: With a coil system, perhaps we could connect the existing power cable to a charging pad mounted on the top or side. Then the drone idea we discussed could reach it more easily. It could also carry the computer.

Participant: We are starting another brainstorming discussion while we have an expert here. Let's maximize his speaking time. What do you think of these three approaches?

Expert: Something similar came to mind with the previous group. To make charging work reliably, you might need a designated place in the room—a little Siemens corner where the systems are parked and charged.

The biggest challenge I see with a robot is physical access. Storage areas do not necessarily look as tidy as this. Someone could push the machine in and then park another one in front of it.

Participant: In that case, the robot could notify someone: “I need a hand here.”

Expert: Yes, but you need to consider whether it can work in the hospital environment.

Participant: We were told that systems often stand in hallways rather than designated rooms.

Expert: It depends on the hospital. There is no single “normal” hospital setup.

Participant: Why does the robot have to make a physical connection? With wireless power, it would only have to get close.

Participant: That brings us back to our original topic. I like the coil idea, but the current systems already have an Ethernet port and a power cord. If those connections can do the job, we can build on them.

We will probably see more robots performing these operations. NVIDIA and many Chinese companies are pushing robotics, and staff shortages could bring more robots into hospitals. A robot could eventually become a more general service device that also helps maintain the equipment.

Expert: Another question: if the robot plugs in a USB device containing an update, how does it get feedback that installation succeeded?

Participant: We were thinking of a USB cable connecting two devices, rather than simply inserting a USB stick.

Expert: Let me show you how we currently handle a manual USB installation.

At the end of the update, the screen displays a QR code. The user scans it with a phone, gets a number, and types that number into the system. It identifies the system by its serial number and confirms that the software was installed. That is how we currently report a manual USB installation back to teamplay Fleet.

Participant: A kind of two-factor confirmation?

Expert: Yes, a confirmation process. With an Ethernet connection, the system can communicate directly. But if there is no connection, you still need a way to report the result.

Participant: The robot would provide that connection.

Expert: That would address the reporting question. For a USB-based approach, it is still something to think about. You need to track whether the whole process finished successfully.

The other major issue is an update that fails outside working hours. Nobody notices until the next day, when the customer finds that the system cannot be used.

Participant: I see the problem, but what is the operational response? Suppose I start an update after work and go home because it takes one or two hours. Then I get a push notification saying, “Update failed.” What do I do?

Participant: In a previous setting, we would immediately roll back to the original state.

Participant: But from the perspective of the normal user who has already gone home: who responds? Do they get back in the car and drive to the hospital? Even if we provide the information, what process follows?

Expert: At the moment, someone tells us the update failed. Then a Siemens service engineer or a contractor may have to drive there and restore the system.

Participant: What are the service-level agreements? What is the response time?

Expert: Our contractors generally work to the same service level as Siemens. But there is no single response time for every customer. You can buy contracts with very fast response times, but they are expensive. That may require someone nearby who can reach the hospital quickly.

Depending on the contract, the response might be an hour or an hour and a half. It depends on what is agreed.

Participant: Sometimes it might be a day or two?

Expert: For our Siemens contracts, response times are quite often measured in hours.

Participant: Returning to the original idea, are there any other questions we need the expert to clarify?

Participant: Is the computer separate from the detector and the generator, even in the current machine?

Expert: Yes. They are physically integrated into the system, but they have separate connections and components.

Participant: Is this the battery backup—the UPS?

Expert: Yes. But the UPS is intended only for a safe shutdown. It does not let you keep working for another two or three minutes.

Participant: Does the system have an indoor-positioning device, so a robot would know where it was last shut down—for example, which operating room it was in?

Expert: No, not as a standard feature on this system.

Participant: It is a large machine, but I suppose it could still be difficult to find in a large hospital.

Expert: I have heard of projects around teamplay that track devices and show their locations on a map. I heard or saw something along those lines last year, but I cannot give you a definite description of the current implementation.

Participant: We also need to identify the correct machine. If a robot enters a room to update one system, it must verify that it has found the intended device before proceeding.

Participant: Could that be done over Ethernet? We should be able to read the serial number.

Expert: Normally, you would check the serial number to confirm that it is the correct system.

Participant: Otherwise, we would need something like a QR code. But the serial number, device ID, or MAC address should give us unique identifiers.

Participant: Do you know the computer's power rating?

Expert: Unfortunately not. You would probably need to ask Christoph or Sebastian.

Participant: Do you know anything about the PC specifications that would let me estimate it? Is it an HP system or another enterprise or consumer PC?

Expert: The hardware changes frequently, so I have lost track of the exact configurations.

Participant: Yesterday you mentioned three computer configurations when ordering a new machine.

Expert: Yes, there are different configurations for the computer part.

Participant: For the hackathon, we can state our assumptions. At the end of the day, the system can be supplied through a Schuko plug. That is what I like about the general robot approach: using existing connections might give us better backward compatibility than adding a coil to every machine.

Participant: A coil solution also raises questions about the required voltage and electromagnetic interference. North America uses a different mains voltage.

Participant: I like the idea, but we could present wireless charging as a future option. Now we need to get lunch.

Participant: Will you be at the pitches tomorrow?

Expert: I don't know yet, but I would like to be.

Participant: Hopefully we can also send you a recording. Thank you very much for your time. We really appreciate it.
