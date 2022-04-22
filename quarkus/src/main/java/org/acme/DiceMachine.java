package org.acme;
import java.util.Random;

public class DiceMachine {

    public int[] dice(int sides, int roles){

        int[] rolled ={};

        for(int i=1;i<roles;i++){
            Random random = new Random();
            rolled[i] = random.nextInt(sides);
        }
        return rolled;
    }

}
