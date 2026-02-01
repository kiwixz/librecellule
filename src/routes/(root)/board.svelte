<script lang="ts">
  import Card from '$lib/card.svelte'

  let props = $props()
</script>

<div class="">
  <div class="flex">
    <div class="flex p-[2%] gap-[1%]">
      {#each props.game?.cards.depots as card (card)}
        <Card {...card} />
      {/each}
    </div>

    <div class="flex p-[2%] gap-[1%]">
      {#each props.game?.cards.foundations as card (card)}
        <Card {...card} />
      {/each}
    </div>
  </div>

  <div class="flex p-[2%] gap-[1%]">
    {#each props.game?.cards.tableau as pile (pile)}
      <div class="grid *:row-1 *:col-1">
        {#each pile as card, i (card)}
          <div style="margin-top: {i * 40}%" draggable="true">
            <Card {...card} />
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>
