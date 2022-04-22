package org.acme;

import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.operators.multi.builders.StreamBasedMulti;
import org.jboss.resteasy.reactive.RestStreamElementType;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.sse.OutboundSseEvent;
import javax.ws.rs.sse.Sse;
import javax.ws.rs.sse.SseBroadcaster;
import javax.ws.rs.sse.SseEventSink;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.function.Supplier;
import java.util.stream.Stream;

@Path("/dice")
public class DiceResource {

    private Sse sse = new

    private Map<String, SseBroadcaster> broadcasters = new HashMap<>();

    @Path("/roll")
    public void roll() {
        OutboundSseEvent event = sse.newEventBuilder()
                .data(1)
                .build();
        broadcasters.forEach((id, broadcaster) -> broadcaster.broadcast(event));
    }

    @GET
    @Path("/sub/{username}")
    @Produces(MediaType.SERVER_SENT_EVENTS)
    @RestStreamElementType(MediaType.APPLICATION_JSON)
    public void stream(@Context SseEventSink sseEventSink, @PathParam("username") String username) {
        SseBroadcaster broadcaster = broadcasters.computeIfAbsent(username, newBroadcaster -> sse.newBroadcaster());
        broadcaster.register(sseEventSink);
    }
}
