
<script setup lang="ts">

import BaseButton from "@/components/BaseButton.vue";
import AppLayout from "@/templates/AppLayout.vue";
</script>

<template>
    <AppLayout>
        <template #header>
            <div class="header">
                <div class="container">
                    <BaseHeading title="Privacy is a fundamental human right."
                        subtitle="Location privacy isn't just nice to have. It can save your life." />
                    <p>Cartes.io was, and is, a platform for anyone to freely and safely share location data. Its been
                        used by NGOs, activists, protesters, and many more people at high risk of surveillance and
                        attack.</p>
                    <BaseButton href="#faq">Jump to FAQ</BaseButton>
                </div>
            </div>
        </template>
        <div>
            <!-- <section>
                <h2>Maps privacy</h2>
                <p>You can create a map without logging in and providing any personal data.</p>

                <p>When you create a map like this, our servers will provide your browser with a secret token that must
                    be
                    used to edit, update, and delete the map. Because only you will have this token, no one else will be
                    able to modify your map.</p>

                <p>By default, your map is not publicly visible to anyone. That means that it cannot be seen on Google
                    or
                    other search engines,
                    does not appear in our search results, and cannot be found without its specific link. You can
                    configure
                    the level of map privacy under "Map settings".</p>

                <p>Only people that are logged in will be able to create markers on your map by default (except you; you
                    can
                    always create markers if you are the person that has created the marker, regardless if you are
                    logged in
                    or not). This means that if someone else was to submit markers on your map, there is a way to
                    identify
                    who did this (but we may choose not to disclose this information out of respect for the privacy of
                    our
                    users).</p>

                <p>You can change this setting to allow anyone (even people not logged in) to create markers on your
                    map, or
                    allow only yourself and block everyone else, under "Map settings".</p>

                <h2>Live data privacy</h2>
                <p>Maps are live-by-design, which allows everyone looking at a given map to see the most up-to-date
                    information.</p>
            </section> -->
            <section id="faq">
                <h2>Privacy FAQ</h2>

                <h3>General</h3>
                <details>
                    <summary>What country does Cartes.io store data in?</summary>
                    <p>Cartes.io uses Amazon Web Services (AWS) with servers in Paris, France.</p>
                </details>

                <details>
                    <summary>Is my email address ever public or shared with third-parties?</summary>
                    <p>No.</p>
                </details>

                <h3>Maps</h3>
                <details>
                    <summary>Who can see my map?</summary>
                    <ul>
                        <li><b>Nobody, if</b> your map is set to "Private". You must be logged in to set a map to
                            private, as this is the safest way we can ensure that only you are the one looking at your
                            own map.</li>
                        <li><b>Anyone with a link, if</b> your map is set to "Only people with the link". This is the
                            default option. Be careful where and with who you share the link to your map to.</li>
                        <li><b>Everybody, if</b> your map is set to "Everyone". Only with this setting set to "Everyone"
                            will your map show up on Google, our search results, and possibly homepage.</li>
                    </ul>
                    <p>You can edit your map visibility settings under "Map settings", then "Who can see my map".</p>
                </details>

                <details>
                    <summary>Can people see that I am the author of my map?</summary>
                    <ul>
                        <li><b>No, if</b> you've created your map while you were not logged in, and the map is still not
                            linked to your account.</li>
                        <li><b>No, if</b> you've created your map while being logged in and/or your map is associated to
                            your account, but don't have your profile set to "public". In this case, we will inform
                            others that the map was created by a logged-in person, but no other details will be shared.
                            This lets others see that the map was created by a "valid" person (someone who verified
                            their email address with us), but not who that person is.
                        </li>
                        <li><b>Yes, if</b> you've created your map while being logged in and/or your map is associated
                            to your account, and your profile is set to "public"</li>
                    </ul>
                    <p>You can edit your profile visibility after logging in. Hover over your username at the top,
                        choose "Settings",
                        then uncheck "Public profile".</p>
                </details>

                <details>
                    <summary>Who can change my map name, description, settings, or delete it?</summary>
                    <p>Only you can change your map name, description, settings, or delete your map. If you've created a
                        map that is not associated with your user account, you can only update or delete your map from
                        the same device that created.</p>
                </details>

                <details>
                    <summary>Who can create markers on my map?</summary>
                    <ul>
                        <li><b>Nobody, if</b> your map setting for markers is set to "No one". Even with this setting,
                            you are able to create markers on your own map (see also - "Who can change my map name,
                            description, settings, or delete it?").</li>
                        <li><b>Anyone that is logged in, if</b> your map is set to "Only people that are logged in".
                            This is the default option.</li>
                        <li><b>Everybody, if</b> your map is set to "Everyone".</li>
                    </ul>
                    <p>You can edit your map marker permission settings under "Map settings", then "Who can create
                        markers".</p>
                </details>

                <details>
                    <summary>Can people see the maps I have placed markers on?</summary>
                    <ul>
                        <li><b>No, if</b> you've created your markers while you were not logged in.</li>
                        <li><b>No, if</b> you've created your markers while being logged in but don't have your profile
                            set to "public". In this
                            case, others will see that the marker was created by a logged-in person, but no other
                            details will be shared.
                            This lets others see that the marker was created by a "valid" person (someone who verified
                            their email address with us), but not who that person is.
                        </li>
                        <li><b>Yes, if</b> you've created your markers while being logged in and your profile is set to
                            "public", and the maps you have created them on have their map visibility settings set to
                            "Everyone".</li>
                    </ul>
                    <p>You can edit your profile visibility after logging in. Hover over your username at the top,
                        choose "Settings",
                        then uncheck "Public profile".</p>
                </details>

                <h3>Markers</h3>
                <details>
                    <summary>Can I create markers on any map?</summary>
                    <p>You can create markers on your own maps at any time. You can only create markers on maps not made
                        by you if the map author has allowed it in their settings.</p>
                </details>
                <details>
                    <summary>Can people see that I am the author of my markers?</summary>
                    <ul>
                        <li><b>No, if</b> you've created your markers while you were not logged in.</li>
                        <li><b>No, if</b> you've created your markers while being logged in but don't have your profile
                            set to "public". In this case, others will see that the marker was created by a logged-in
                            person, but no other details will be shared.
                            This lets others see that the marker was created by a "valid" person (someone who verified
                            their email address with us), but not who that person is.
                        </li>
                        <li><b>Yes, if</b> you've created your markers while being logged in and your profile is set to
                            "public".</li>
                    </ul>
                    <p>You can edit your profile visibility after logging in. Hover over your username at the top,
                        choose "Settings",
                        then uncheck "Public profile".</p>
                </details>

                <h3>Device Location</h3>
                <details>
                    <summary>Do I need to share my location to use Cartes.io?</summary>
                    <p>No.</p>
                </details>

                <details>
                    <summary>What features require that I share my location?</summary>
                    <ul>
                        <li>Seeing the distance and heading to each marker from your current location.</li>
                        <li>Seeing your current location on the map.</li>
                        <li>Augmented Reality map views.</li>
                        <li>Optionally sharing your current location with others looking at the map.</li>
                    </ul>
                </details>

                <details>
                    <summary>Who can see my location on a map?</summary>
                    <p>Even with "Location services" enabled:</p>
                    <ul>
                        <li><b>Nobody by default</b>.</li>
                        <li><b>People currently looking at the map, if</b> you're currently on the same map, you've
                            enabled "Location services", and
                            you have explicitly checked "Share your location with others". Cartes.io does not store your
                            location or its history anywhere.
                        </li>
                    </ul>
                    <p>You can set "Location services" under "Map display options" or click on the
                        geolocation-pointer button on the upper-left side of the map. More options will show when
                        "Location services" is enabled. Enabling location services does not share your
                        location with anyone, including us, unless you explicitly check the other relevant options.</p>
                </details>

                <details>
                    <summary>If I choose to share my location on the map, what will others see me as?</summary>
                    <ul>
                        <li><b>"Anonymous X12X", if</b> you're not logged in. A random new number is generated each time
                            you open a map.</li>
                        <li><b>"Cartes.io user X12X", if</b> you are currently logged in but don't have your profile
                            set to "public". This lets others see that the marker was created by a "valid" person
                            (someone who verified
                            their email address with us), but not who that person is. A random new number is also
                            generated each time you open a map.
                        </li>
                        <li><b>"Your username", if</b> you are currently logged in and your profile is set to
                            "public".</li>
                    </ul>
                    <p>You can edit your profile visibility after logging in. Hover over your username at the top,
                        choose "Settings",
                        then uncheck "Public profile".</p>
                </details>

                <details>
                    <summary>How do I stop sharing my location?</summary>
                    <p>Uncheck "Share your location with others" under "Map display options" or disable "Location
                        services" entirely.</p>
                </details>

                <h3>Live features</h3>
                <details>
                    <summary>What do other people looking at the same map see me as?</summary>
                    <p>In some cases, you may be listed as a user currently viewing a given map. Only other users on the
                        same map may be able to see this. This does not show your current location or what you're
                        looking at on the map.</p>
                    <ul>
                        <li><b>You're not visible, if</b> the map you're currently on is private, and you're not logged
                            in or you're not the
                            map owner. You also won't see others or get live updates in this case.</li>
                        <li><b>"Anonymous X12X", if</b> you're not logged in. A random new number is generated each time
                            you open a map.</li>
                        <li><b>"Cartes.io user X12X", if</b> you are currently logged in but don't have your profile
                            set to "public". This lets others see that the marker was created by a "valid" person
                            (someone who verified
                            their email address with us), but not who that person is. A random new number is also
                            generated each time you open a map.
                        </li>
                        <li><b>"Your username", if</b> you are currently logged in and your profile is set to
                            "public".</li>
                    </ul>
                    <p>You can edit your profile visibility after logging in. Hover over your username at the top,
                        choose "Settings",
                        then uncheck "Public profile".</p>
                </details>

                <details>
                    <summary>Can everyone see what I'm looking at on a map?</summary>
                    <ul>
                        <li><b>No by default, if</b> you have not explicitly enabled "Share your view with others".</li>
                        <li><b>No, if</b> the map you are currently on is private, and you're not logged in or you're
                            not the map owner.
                        </li>
                        <li><b>Yes, if</b> you have explicitly enabled "Share your view with others" under "Map display
                            options".</li>
                    </ul>
                </details>

                <details>
                    <summary>Can anyone see my current location on a map?</summary>
                    <ul>
                        <li><b>No by default, if</b> you have not explicitly enabled "Share your location with others".
                        </li>
                        <li><b>No, if</b> the map you are currently on is private, and you're not logged in or you're
                            not the map owner.
                        </li>
                        <li><b>Yes, if</b> you have explicitly enabled "Share your location with others" under "Map
                            display options", after enabling "Location services".</li>
                    </ul>
                </details>

            </section>
        </div>
    </AppLayout>
</template>
<style scoped>
.header {
    height: 60vh;
    background-color: var(--background-color);
    /* background: linear-gradient(var(--card-border-color), var(--background-color)), url(/images/earth.jpg) no-repeat; */
    background-image: linear-gradient(0deg, var(--background-color) 0%, var(--card-border-color) 100%);
    background-size: cover;

    display: flex;
    flex-direction: column;
    justify-content: center;
}
</style>